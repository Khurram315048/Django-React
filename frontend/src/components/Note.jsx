import React, { useState } from "react";
import "../styles/Note.css"
import { PencilIcon, TrashIcon, CheckIcon, XIcon } from "./Icons";


function Note({note,onDelete,onUpdate}){
    const formattedDate=new Date(note.created_at).toLocaleDateString("en-US")
     const wasEdited = note.updated_at &&
        (new Date(note.updated_at).getTime() - new Date(note.created_at).getTime()) > 1000;
    const editedDate = wasEdited ? new Date(note.updated_at).toLocaleDateString("en-US") : null;


    const [isEditing,setIsEditing]=useState(false)
    const [editTitle,setEditTitle]=useState(note.title)
    const [editContent,setEditContent]=useState(note.content)

    const handleSave=()=>{
        if(!editTitle.trim() || !editContent.trim()) return;
        onUpdate(note.id,{title:editTitle,content:editContent})
        setIsEditing(false)
    }

    const handleCancel=()=>{
        setEditTitle(note.title)
        setEditContent(note.content)
        setIsEditing(false)
    }

    if(isEditing){
        return (
            <div className="note-container">
                <input
                    className="note-edit-input"
                    type="text"
                    value={editTitle}
                    onChange={(e)=>setEditTitle(e.target.value)}
                />
                <textarea
                    className="note-edit-textarea"
                    value={editContent}
                    onChange={(e)=>setEditContent(e.target.value)}
                />
                <div className="note-actions">
                    <button className="save-button" onClick={handleSave}>Save</button>
                    <button className="cancel-button" onClick={handleCancel}>Cancel</button>
                </div>
            </div>
        )
    }

    return (
        <div className="note-container">
            <p className="note-title">{note.title}</p>
            <p className="note-content">{note.content}</p>
            <p className="note-date">
                {formattedDate}
                {wasEdited && <span className="note-edited"> · updated {editedDate}</span>}
            </p>
            <div className="note-actions">
                <button className="update-button" onClick={()=>setIsEditing(true)}>
                    Update Note
                </button>
                <button className="delete-button" onClick={() =>onDelete(note.id)}>
                    Delete Note
                </button>
            </div>
        </div>
    );
}

export default Note;