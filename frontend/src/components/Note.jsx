import React from "react";
import "../styles/Note.css"


function Note({note,onDelete}){
    const formattedDate=new Date(note.created_at).toLocaleDateString("en-US")
    
    return (
        <div className="note-container">
            <p className="note-tilte">{note.tite}</p>
            <p className="note-content">{note.content}</p>
            <p className="note-date">{formattedDate}</p>
            <button className="delete-button" onClick={() =>onDelete(note.id)}>
                Delete Note
            </button>
        </div>
    );
}

export default Note;