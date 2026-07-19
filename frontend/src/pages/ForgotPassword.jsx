import { useState } from "react";
import api from "../api";
import "../styles/Form.css";

function ForgotPassword(){
    const [email,setEmail]=useState("");
    const [message,setMessage]=useState("");
    const [loading,setLoading]=useState(false);

    const handleSubmit= async (e) =>{
        e.preventDefault();
        setLoading(true);
        try{
            await api.post("/api/password-reset/",{email});
            setMessage("If that email exists, a reset link was sent.");
        }catch{
            setMessage("Something went wrong. Try again.");
        }finally{
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>Forgot password</h1>
            {message && <div className="form-error">{message}</div>}
            <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
            />
            <button className="form-button" type="submit" disabled={loading}>
                Send reset link
            </button>
           <p className="form-switch">
            <p className="form-switch">
                <a href="/login">Back to Login?</a>
            </p>
        </p>
        </form>
    );
}

export default ForgotPassword;