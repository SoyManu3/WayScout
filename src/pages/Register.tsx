import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { MapPin, ArrowLeft } from "lucide-react";

export function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulación de registro - en producción conectaría con backend
    if (formData.password === formData.confirmPassword) {
      navigate("/");
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-green-50 to-green-100">
      <div className="flex-1 overflow-y-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-green-700 hover:text-green-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>

        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl text-green-800 mb-2">Crear Cuenta</h1>
          <p className="text-green-600">Únete a nuestra comunidad</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-green-800">
              Nombre completo
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Juan Pérez"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="bg-white border-green-200 focus:border-green-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-green-800">
              Correo electrónico
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
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
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="bg-white border-green-200 focus:border-green-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-green-800">
              Confirmar contraseña
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              className="bg-white border-green-200 focus:border-green-500"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-6 mt-6"
          >
            Registrarse
          </Button>
        </form>

        {/* Terms */}
        <p className="mt-6 text-sm text-center text-green-600">
          Al registrarte aceptas nuestros{" "}
          <span className="underline">Términos y Condiciones</span> y{" "}
          <span className="underline">Política de Privacidad</span>
        </p>
      </div>
    </div>
  );
}
