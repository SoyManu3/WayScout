import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { MapPin, AlertTriangle } from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulación de login - en producción conectaría con backend
    navigate("/");
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-green-50 to-green-100">
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl text-green-800 mb-2">WayScout</h1>
          <p className="text-green-600">
            Alertas en tiempo real para tus viajes
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-green-800">
              Correo electrónico
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white border-green-200 focus:border-green-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-green-800">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white border-green-200 focus:border-green-500"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-6"
          >
            Iniciar Sesión
          </Button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-green-700">
            ¿No tienes cuenta?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-green-600 underline hover:text-green-800"
            >
              Regístrate aquí
            </button>
          </p>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-green-100 rounded-lg border border-green-300">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">
              Recibe notificaciones sobre deslaves, tráfico y condiciones
              climáticas en tiempo real
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
