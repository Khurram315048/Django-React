import {useState} from "react";
import api from "../api";
import {useNavigate} from "react-router-dom";
import{ACCESS_TOKEN,REFRESH_TOKEN} from "../constants";
import "../styles/Form.css";
import LoadingIndicator from "./LoadingIndicator";


function Form({route,method}){

    const [username,setUsername]=useState("")
    const [password,setPassword]=useState("")
    const [loading,setLoading]=useState(false)
    const [errorMsg,setErrorMsg]=useState("")
    const navigate=useNavigate()

    const isLogin = method === "login"
    const name = isLogin ? "Login" : "Register"

    const getErrorMessage=(err)=>{
        if(err.response?.data){
            const data=err.response.data;
            if(typeof data==="string") return data;
            return Object.entries(data).map(([k,v])=>`${k}: ${Array.isArray(v)?v.join(", "):v}`).join(" | ");
        }
        return err.message || "Something went wrong";
    };

    const handleSubmit = async (e) => {
        setLoading(true);
        setErrorMsg("");
        e.preventDefault();
        try{
            const res = await api.post(route, {username,password})
            if(isLogin){
                localStorage.setItem(ACCESS_TOKEN,res.data.access);
                localStorage.setItem(REFRESH_TOKEN,res.data.refresh);
                navigate("/")
            }
            else{
                navigate("/login")
            }
        }
        catch(error){
            setErrorMsg(getErrorMessage(error))
        } finally{
            setLoading(false)
        }
    };

    return (
    <form onSubmit={handleSubmit} className="form-container">
        <h1>{name}</h1>

        {errorMsg && <div className="form-error">{errorMsg}</div>}

        <input 
            className="form-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            required
        />
         <input 
            className="form-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
        />
        {loading  && <LoadingIndicator />}
        <button className="form-button" type="submit" disabled={loading}>{name}</button>

        <p className="form-switch">
            {isLogin ? (
                <>Don't have an account? <a href="/register">Register</a></>
            ) : (
                <>Already have an account? <a href="/login">Login</a></>
            )}
        </p>
    </form>
    );

}

export default Form