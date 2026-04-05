import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import {
  Bell,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CloudRain,
  Car,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

type EventType = "deslave" | "trafico" | "clima";
type EventSource = "verified" | "user";

interface Event {
  id: string;
  type: EventType;
  title: string;
  location: string;
  time: string;
  source: EventSource;
  verified: boolean;
  votes: { up: number; down: number };
  description: string;
}

const mockEvents: Event[] = [
  {
    id: "1",
    type: "deslave",
    title: "Deslave en Autopista Norte",
    location: "Km 45, Autopista Norte",
    time: "Hace 15 min",
    source: "verified",
    verified: true,
    votes: { up: 124, down: 3 },
    description: "Carril izquierdo bloqueado por derrumbe",
  },
  {
    id: "2",
    type: "trafico",
    title: "Tráfico Pesado",
    location: "Av. Principal, Centro",
    time: "Hace 30 min",
    source: "user",
    verified: false,
    votes: { up: 45, down: 2 },
    description: "Congestión vehicular por accidente",
  },
  {
    id: "3",
    type: "clima",
    title: "Lluvia Intensa",
    location: "Zona Sur",
    time: "Hace 45 min",
    source: "verified",
    verified: true,
    votes: { up: 89, down: 1 },
    description: "Visibilidad reducida y calzada resbaladiza",
  },
  {
    id: "4",
    type: "deslave",
    title: "Vía Obstruida",
    location: "Carretera La Montaña",
    time: "Hace 1 hora",
    source: "user",
    verified: false,
    votes: { up: 67, down: 5 },
    description: "Piedras en la vía, precaución",
  },
];

export function Home() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | EventType>("all");

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case "deslave":
        return <AlertTriangle className="w-5 h-5" />;
      case "trafico":
        return <Car className="w-5 h-5" />;
      case "clima":
        return <CloudRain className="w-5 h-5" />;
    }
  };

  const getEventColor = (type: EventType) => {
    switch (type) {
      case "deslave":
        return "bg-red-500";
      case "trafico":
        return "bg-yellow-500";
      case "clima":
        return "bg-blue-500";
    }
  };

  const filteredEvents =
    filter === "all"
      ? mockEvents
      : mockEvents.filter((event) => event.type === filter);

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="bg-green-600 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl mb-1">WayScout</h1>
            <p className="text-green-100 text-sm">Alertas en tu ruta</p>
          </div>
          <button className="relative p-2 bg-green-500 rounded-full hover:bg-green-700 transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-green-500 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-2xl">12</span>
            </div>
            <p className="text-xs text-green-100">Activas hoy</p>
          </div>
          <div className="bg-green-500 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-2xl">3</span>
            </div>
            <p className="text-xs text-green-100">En tu área</p>
          </div>
          <div className="bg-green-500 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-2xl">8</span>
            </div>
            <p className="text-xs text-green-100">Verificadas</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              filter === "all"
                ? "bg-green-600 text-white"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter("deslave")}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              filter === "deslave"
                ? "bg-green-600 text-white"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            Deslaves
          </button>
          <button
            onClick={() => setFilter("trafico")}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              filter === "trafico"
                ? "bg-green-600 text-white"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            Tráfico
          </button>
          <button
            onClick={() => setFilter("clima")}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              filter === "clima"
                ? "bg-green-600 text-white"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            Clima
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="px-4 space-y-3">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            onClick={() => navigate(`/event/${event.id}`)}
            className="bg-white rounded-xl shadow-md p-4 border border-green-100 hover:border-green-300 transition-all cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div
                className={`${getEventColor(
                  event.type,
                )} p-3 rounded-full text-white flex-shrink-0`}
              >
                {getEventIcon(event.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-green-900">{event.title}</h3>
                  {event.verified && (
                    <Badge className="bg-green-600 text-white text-xs flex-shrink-0">
                      ✓ Verificado
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>

                <p className="text-sm text-green-700 mb-3">
                  {event.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-500">{event.time}</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-green-600">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm">{event.votes.up}</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-400">
                      <ThumbsDown className="w-4 h-4" />
                      <span className="text-sm">{event.votes.down}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
