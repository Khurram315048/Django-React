import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Form.css";

function ResetPassword(){
    const {uid,token}=useParams();
    const navigate=useNavigate();
    const [password,setPassword]=useState("");
    const [errorMsg,setErrorMsg]=useState("");
    const [loading,setLoading]=useState(false);

    const handleSubmit= async (e) =>{
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");
        try{
            await api.post("/api/password-reset/confirm/",{
                uid,token,new_password: password,
            });
            navigate("/login");
        }catch(err){
            setErrorMsg(err.response?.data?.detail || "Reset failed.");
        }finally{
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>Reset password</h1>
            {errorMsg && <div className="form-error">{errorMsg}</div>}
            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                required
                minLength={8}
            />
            <button className="form-button" type="submit" disabled={loading}>
                Reset password
            </button>
        </form>
    );
}

export default ResetPassword;