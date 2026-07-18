import {useState,useEffect,useRef} from "react";
import {Link} from "react-router-dom";
import api from "../api";
import { TrashBinIcon, RestoreIcon, TrashIcon, ArrowLeftIcon } from "../components/Icons";
import "../styles/Home.css";
import "../styles/Trash.css";


function Trash(){

    const[notes,setNotes]=useState([]);
    const[status,setStatus]=useState(null);
    const statusTimeoutRef=useRef(null);

    useEffect(() => {
        getTrash();
        return () => clearTimeout(statusTimeoutRef.current);
    },[])

    const showStatus=(type,message)=>{
        clearTimeout(statusTimeoutRef.current);
        setStatus({type,message});
        statusTimeoutRef.current=setTimeout(()=>setStatus(null),3500);
    };

    const getErrorMessage=(err)=>{
        if(err.response?.data){
            const data=err.response.data;
            if(typeof data==="string") return data;
            return Object.entries(data).map(([k,v])=>`${k}: ${Array.isArray(v)?v.join(", "):v}`).join(" | ");
        }
        return err.message || "Something went wrong";
    };

    const getTrash = () =>{
        api
        .get("/api/notes/trash/")
        .then((res) => res.data)
        .then((data) => setNotes(data))
        .catch((err) => showStatus("error", getErrorMessage(err)));
    };

    const restoreNote = (id) => {
        api
        .patch(`/api/notes/restore/${id}/`,{})
        .then((res)=>{
            if(res.status===200) showStatus("success","Note restored");
            else showStatus("error","Failed to restore note");
            getTrash();
        }).catch((err)=>showStatus("error", getErrorMessage(err)));
    };

    const permanentlyDelete = (id) => {
        if(!window.confirm("Permanently delete this note? This cannot be undone.")) return;
        api
        .delete(`/api/notes/trash/${id}/`)
        .then((res)=>{
            if(res.status===204) showStatus("success","Note permanently deleted");
            else showStatus("error","Failed to delete note");
            getTrash();
        }).catch((err)=>showStatus("error", getErrorMessage(err)));
    };

    return (
    <div className="page">
        {status && (
            <div className={`status-banner status-${status.type}`}>
                {status.message}
            </div>
        )}

        <header className="page-header">
            <TrashBinIcon />
            <h1>Trash</h1>
            <span className="note-count">{notes.length} {notes.length===1?"note":"notes"}</span>
            <Link to="/" className="back-link">
                <ArrowLeftIcon /> Back to notes
            </Link>
        </header>

        {notes.length === 0 ? (
            <div className="empty-state">Trash is empty.</div>
        ) : (
            <div className="notes-grid">
                {notes.map((note)=>(
                    <div className="note-container trash-note" key={note.id}>
                        <p className="note-title">{note.title}</p>
                        <p className="note-content">{note.content}</p>
                        <p className="note-date">{new Date(note.created_at).toLocaleDateString("en-US")}</p>
                        <div className="note-actions">
                            <button className="update-button" onClick={()=>restoreNote(note.id)}>
                                <RestoreIcon /> Restore
                            </button>
                            <button className="delete-button" onClick={()=>permanentlyDelete(note.id)}>
                                <TrashIcon /> Delete forever
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
    );
}

export default Trash;