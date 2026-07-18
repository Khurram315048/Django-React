import {useState,useEffect,useRef} from "react";
import {useNavigate} from "react-router-dom";
import api from "../api";
import Note from "../components/Note";
import {PlusIcon, NotebookIcon,LogoutIcon} from "../components/Icons";
import {ACCESS_TOKEN,REFRESH_TOKEN} from "../constants";
import "../styles/Home.css";



function Home(){

    const[notes,setNotes]=useState([]);
    const[content,setContent]=useState("");
    const[title,setTitle]=useState("");
    const[status,setStatus]=useState(null);
    const statusTimeoutRef=useRef(null);
    const navigate=useNavigate();


    useEffect(() => {
        getNotes();
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
        if(!window.confirm("Delete this note?")) return;
        api
        .delete(`/api/notes/delete/${id}/`)
        .then((res)=>{
            if(res.status===204) showStatus("success","Note deleted");
            else showStatus("error","Failed to delete note");
            getNotes();
        }).catch((error) => showStatus("error", getErrorMessage(error)));

       
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


    return (
    <div className="page">
        {status && (
            <div className={`status-banner status-${status.type}`}>
                {status.message}
            </div>
        )}

        <header className="page-header">
            <NotebookIcon />
            <h1>My Notes</h1>
            <span className="note-count">{notes.length} {notes.length===1?"note":"notes"}</span>
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
            <h2>Your notes</h2>
            {notes.length === 0 ? (
                <div className="empty-state">No notes yet — write your first one above.</div>
            ) : (
                <div className="notes-grid">
                    {notes.map((note)=>(
                        <Note note={note} onDelete={deleteNote} onUpdate={updateNote} key={note.id}/>
                    ))}
                </div>
            )}
        </section>
    </div>
    );
}

export default Home;