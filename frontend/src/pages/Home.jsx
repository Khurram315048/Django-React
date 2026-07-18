import {useState,useEffect,useRef,useMemo} from "react";
import {useNavigate} from "react-router-dom";
import api from "../api";
import Note from "../components/Note";
import { PlusIcon, NotebookIcon, LogoutIcon, SearchIcon, CloseIcon, TrashBinIcon } from "../components/Icons";
import { Link } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Home.css";



function Home(){

    const[notes,setNotes]=useState([]);
    const[content,setContent]=useState("");
    const[title,setTitle]=useState("");
    const[status,setStatus]=useState(null);
    const[searchQuery,setSearchQuery]=useState("");
    const statusTimeoutRef=useRef(null);
    const navigate=useNavigate();

    useEffect(() => {
        getNotes();
        return () => clearTimeout(statusTimeoutRef.current);
    },[])

    const showStatus=(type,message,undoAction=null)=>{
        clearTimeout(statusTimeoutRef.current);
        setStatus({type,message,undoAction});
        statusTimeoutRef.current=setTimeout(()=>setStatus(null), undoAction ? 5000 : 3500);
    };

    const getErrorMessage=(err)=>{
        if(err.response?.data){
            const data=err.response.data;
            if(typeof data==="string") return data;
            return Object.entries(data).map(([k,v])=>`${k}: ${Array.isArray(v)?v.join(", "):v}`).join(" | ");
        }
        return err.message || "Something went wrong";
    };

    const handleLogout=()=>{
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        navigate("/login");
    };

    const getNotes = () =>{
        api
        .get("/api/notes/")
        .then((res) => res.data)
        .then((data) => {setNotes(data);})
        .catch((err) => showStatus("error", getErrorMessage(err)));

    };


    const deleteNote=(id) =>{
        api
        .delete(`/api/notes/delete/${id}/`)
        .then((res)=>{
            if(res.status===204){
                showStatus("success","Note deleted", ()=>restoreNote(id));
            }
            else showStatus("error","Failed to delete note");
            getNotes();
        }).catch((error) => showStatus("error", getErrorMessage(error)));
    };

    const restoreNote=(id)=>{
        clearTimeout(statusTimeoutRef.current);
        setStatus(null);
        api
        .patch(`/api/notes/restore/${id}/`,{})
        .then((res)=>{
            if(res.status===200) showStatus("success","Note restored");
            else showStatus("error","Failed to restore note");
            getNotes();
        }).catch((error)=>showStatus("error", getErrorMessage(error)));
    };

    const updateNote=(id,updatedFields)=>{
        api
        .patch(`/api/notes/delete/${id}/`,updatedFields)
        .then((res)=>{
            if(res.status===200) showStatus("success","Note updated");
            else showStatus("error","Failed to update note");
            getNotes();
        }).catch((error)=>showStatus("error", getErrorMessage(error)));
    };


    const createNote= (e)=>{
        e.preventDefault();
        api.
        post("/api/notes/",{content,title})
        .then((res) =>{
            if(res.status===201){
                showStatus("success","Note created");
                setTitle("");
                setContent("");
            }
            else showStatus("error","Failed to create note");
            getNotes();
        }).catch((err) => showStatus("error", getErrorMessage(err)));
       
    };

    const filteredNotes = useMemo(()=>{
        const terms = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
        if(terms.length === 0) return notes;
        return notes.filter((note)=>{
            const haystack = `${note.title} ${note.content}`.toLowerCase();
            return terms.every((term)=>haystack.includes(term));
        });
    },[notes,searchQuery]);

    const isSearching = searchQuery.trim().length > 0;


    return (
    <div className="page">
        {status && (
            <div className={`status-banner status-${status.type}`}>
                {status.message}
                {status.undoAction && (
                    <button className="status-undo" onClick={status.undoAction}>Undo</button>
                )}
            </div>
        )}

        <header className="page-header">
            <NotebookIcon />
            <h1>My Notes</h1>
            <span className="note-count">{notes.length} {notes.length===1?"note":"notes"}</span>
            <Link to="/trash" className="trash-link" aria-label="View trash">
                <TrashBinIcon /> Trash
            </Link>
            <button className="logout-button" onClick={handleLogout} aria-label="Log out">
                <LogoutIcon /> Log out
            </button>
        </header>

        <section className="create-card">
            <h2>Write a new note</h2>
            <form onSubmit={createNote}>
                <label htmlFor="title">Title</label>
                <input type="text"
                id="title"
                name="title"
                required
                placeholder="What's this note about?"
                onChange={(e) =>setTitle(e.target.value)}  value={title} />

                <label htmlFor="content">Content</label>
                <textarea
                id="content"
                name="content"
                required
                placeholder="Write your note..."
                onChange={(e) =>setContent(e.target.value)}  value={content} />

                <button className="submit-button" type="submit">
                    <PlusIcon /> Add note
                </button>
            </form>
        </section>

        <section className="notes-section">
            <div className="notes-section-header">
                <h2>Your notes</h2>
                <div className="search-bar">
                    <SearchIcon className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={(e)=>setSearchQuery(e.target.value)}
                        aria-label="Search notes by title or content"
                    />
                    {isSearching && (
                        <button
                            className="search-clear"
                            onClick={()=>setSearchQuery("")}
                            aria-label="Clear search"
                            type="button"
                        >
                            <CloseIcon />
                        </button>
                    )}
                </div>
            </div>

            {isSearching && (
                <p className="search-result-count">
                    {filteredNotes.length} {filteredNotes.length===1?"result":"results"} for "{searchQuery.trim()}"
                </p>
            )}

            {notes.length === 0 ? (
                <div className="empty-state">No notes yet — write your first one above.</div>
            ) : filteredNotes.length === 0 ? (
                <div className="empty-state">No notes match "{searchQuery.trim()}" — try different keywords.</div>
            ) : (
                <div className="notes-grid">
                    {filteredNotes.map((note)=>(
                        <Note note={note} onDelete={deleteNote} onUpdate={updateNote} key={note.id}/>
                    ))}
                </div>
            )}
        </section>
    </div>
    );
}

export default Home;