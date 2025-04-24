import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_BACKEND_URL;

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/chat", { replace: true });
    }
  }, [navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const payload = isLogin ? loginData : registerData;

    try {
      const res = await axios.post(`${API}${endpoint}`, payload);

      if (isLogin) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", res.data.user.username);
        navigate("/chat");
        console.log("Token set:", res.data.token);
      } else {
        alert("Registration successful! You can now log in.");
        setIsLogin(true);
        setLoginData({ username: "", password: "" });
        setRegisterData({ username: "", password: "" });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-700">
      <div className="bg-white shadow-xl rounded-xl w-full max-w-md overflow-hidden">
        <div
          className="relative w-[200%] flex transition-transform duration-500"
          style={{ transform: isLogin ? "translateX(0%)" : "translateX(-50%)" }}
        >
          {/* Login Form */}
          <div className="w-1/2 p-10">
            <h2 className="text-2xl font-bold mb-2 text-blue-600">Login</h2>
            {error && isLogin && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <form onSubmit={handleAuth} className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                required
                className="w-full border px-4 py-2 rounded"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  className="w-full border px-4 py-2 rounded"
                />
                <span
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-sm text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <input type="checkbox" className="accent-blue-500" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                Login
              </button>
            </form>
          </div>

          {/* Register Form */}
          <div className="w-1/2 p-10">
            <h2 className="text-2xl font-bold mb-2 text-purple-600">Register</h2>
            {error && !isLogin && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <form onSubmit={handleAuth} className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                value={registerData.username}
                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                required
                className="w-full border px-4 py-2 rounded"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                  className="w-full border px-4 py-2 rounded"
                />
                <span
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-sm text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </span>
              </div>
              <button className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600">
                Register
              </button>
            </form>
          </div>
        </div>

        {/* Toggle link */}
        <div className="flex justify-center py-4 border-t mt-4 bg-white">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-sm text-blue-500 hover:underline"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;
