import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  ArrowLeft,
  MapPin,
  Clock,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Shield,
  MessageCircle,
  Share2,
} from "lucide-react";

export function EventDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [votes, setVotes] = useState({ up: 124, down: 3 });

  // Datos de ejemplo
  const event = {
    id,
    type: "deslave",
    title: "Deslave en Autopista Norte",
    location: "Km 45, Autopista Norte",
    time: "Hace 15 min",
    verified: true,
    description:
      "Carril izquierdo bloqueado por derrumbe de aproximadamente 20 metros. Autoridades en el sitio trabajando en la remoción.",
    reportedBy: "Canal Oficial de Carreteras",
    severity: "Alta",
    affectedLanes: "2 de 3 carriles",
    estimatedClearance: "2-3 horas",
  };

  const handleVote = (type: "up" | "down") => {
    if (userVote === type) {
      // Si ya votó lo mismo, cancelar voto
      setUserVote(null);
      setVotes((prev) => ({ ...prev, [type]: prev[type] - 1 }));
    } else {
      // Si votó diferente, cambiar voto
      if (userVote) {
        setVotes((prev) => ({
          ...prev,
          [userVote]: prev[userVote] - 1,
          [type]: prev[type] + 1,
        }));
      } else {
        setVotes((prev) => ({ ...prev, [type]: prev[type] + 1 }));
      }
      setUserVote(type);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-4 hover:text-green-100"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="bg-red-500 p-3 rounded-full">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl mb-1">{event.title}</h1>
            {event.verified && (
              <div className="flex items-center gap-1 text-green-100 text-sm">
                <Shield className="w-4 h-4" />
                <span>Reporte Verificado</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Location & Time */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-green-100">
          <div className="flex items-start gap-3 mb-3">
            <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-green-500 mb-1">Ubicación</p>
              <p className="text-green-900">{event.location}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-green-500 mb-1">Reportado</p>
              <p className="text-green-900">{event.time}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-green-100">
          <h3 className="text-green-900 mb-2">Descripción</h3>
          <p className="text-green-700">{event.description}</p>
        </div>

        {/* Details */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-green-100">
          <h3 className="text-green-900 mb-3">Detalles del Incidente</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-green-600">Severidad</span>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                {event.severity}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-600">Carriles afectados</span>
              <span className="text-green-900">{event.affectedLanes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-600">Tiempo estimado</span>
              <span className="text-green-900">{event.estimatedClearance}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-600">Reportado por</span>
              <span className="text-green-900 text-sm">{event.reportedBy}</span>
            </div>
          </div>
        </div>

        {/* Voting Section */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-green-100">
          <h3 className="text-green-900 mb-3">¿Esta información es precisa?</h3>
          <p className="text-sm text-green-600 mb-4">
            Tu voto ayuda a validar la información para otros usuarios
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => handleVote("up")}
              variant={userVote === "up" ? "default" : "outline"}
              className={`flex-1 ${
                userVote === "up"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "border-green-300 text-green-700 hover:bg-green-50"
              }`}
            >
              <ThumbsUp className="w-5 h-5 mr-2" />
              Sí ({votes.up})
            </Button>
            <Button
              onClick={() => handleVote("down")}
              variant={userVote === "down" ? "default" : "outline"}
              className={`flex-1 ${
                userVote === "down"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "border-green-300 text-green-700 hover:bg-green-50"
              }`}
            >
              <ThumbsDown className="w-5 h-5 mr-2" />
              No ({votes.down})
            </Button>
          </div>
        </div>

        {/* Comments Preview */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-green-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-green-900">Comentarios</h3>
            <span className="text-sm text-green-500">8 comentarios</span>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-green-600 rounded-full"></div>
                <span className="text-sm text-green-900">Carlos M.</span>
                <span className="text-xs text-green-500">Hace 5 min</span>
              </div>
              <p className="text-sm text-green-700">
                Confirmo, el tráfico está detenido. Vía alterna recomendada.
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-green-600 rounded-full"></div>
                <span className="text-sm text-green-900">María L.</span>
                <span className="text-xs text-green-500">Hace 10 min</span>
              </div>
              <p className="text-sm text-green-700">
                Maquinaria trabajando en el sitio
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full mt-3 border-green-300 text-green-700 hover:bg-green-50"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Ver todos los comentarios
          </Button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartir
          </Button>
        </div>
      </div>
    </div>
  );
}
