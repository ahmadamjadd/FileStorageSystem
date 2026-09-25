from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, Folder, File
from app.schemas.folder import FolderCreate, FolderRename, FolderResponse

router = APIRouter(prefix="/api/folders", tags=["Folders"])

@router.get("", response_model=List[FolderResponse])
def get_folders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Folder).filter(Folder.user_id == current_user.id).all()


@router.post("", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
def create_folder(folder: FolderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_folder = Folder(
        name=folder.name,
        parent_id=folder.parent_id,
        user_id=current_user.id
    )
    db.add(new_folder)
    db.commit()
    db.refresh(new_folder)
    return new_folder


@router.put("/{folder_id}", response_model=FolderResponse)
def rename_folder(folder_id: str, data: FolderRename, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    folder = db.query(Folder).filter(Folder.id == folder_id, Folder.user_id == current_user.id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    folder.name = data.name
    db.commit()
    db.refresh(folder)
    return folder


@router.delete("/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_folder(folder_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    folder = db.query(Folder).filter(Folder.id == folder_id, Folder.user_id == current_user.id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    # Simple cascade delete logic (since the foreign keys might not have ON DELETE CASCADE setup correctly during dev if we just alter)
    # Actually, the model has ondelete="CASCADE", but let's just delete it and rely on SQLAlchemy or DB.
    db.delete(folder)
    db.commit()
    return None
