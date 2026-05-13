import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import {
  addReportComment,
  getReport,
  getReportComments,
  getReportUserReaction,
  reactToReport,
  type Report,
  type ReportComment,
} from "../services/reportApi";
import {
  ArrowLeft,
  MapPin,
  Clock,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  MessageCircle,
  Share2,
  Car,
  CloudRain,
} from "lucide-react";

export function EventDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [comments, setComments] = useState<ReportComment[]>([]);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [votes, setVotes] = useState({ up: 0, down: 0 });
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isReacting, setIsReacting] = useState(false);

  useEffect(() => {
    if (!id) {
      setErrorMessage("No se encontro el reporte.");
      setIsLoading(false);
      return;
    }

    let ignore = false;
    setIsLoading(true);
    setErrorMessage(null);

    Promise.all([
      getReport(id),
      getReportComments(id),
      getReportUserReaction(id),
    ])
      .then(([reportData, commentsData, userReaction]) => {
        if (ignore) return;
        setReport(reportData);
        setComments(commentsData);
        setVotes(reportData.reactions);
        setUserVote(
          userReaction.type === "UP"
            ? "up"
            : userReaction.type === "DOWN"
              ? "down"
              : null,
        );
      })
      .catch(() => {
        if (!ignore) {
          setErrorMessage("No fue posible cargar el reporte.");
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  const handleVote = async (type: "up" | "down") => {
    if (!id || isReacting) return;
    if (userVote === type) {
      return;
    }

    setIsReacting(true);
    setErrorMessage(null);

    try {
      const summary = await reactToReport(id, type === "up" ? "UP" : "DOWN");
      setVotes({ up: summary.up, down: summary.down });
      setUserVote(type);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible enviar tu reaccion.",
      );
    } finally {
      setIsReacting(false);
    }
  };

  const handleSubmitComment = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!id || !commentText.trim()) {
      return;
    }

    setIsSubmittingComment(true);
    setErrorMessage(null);

    try {
      const newComment = await addReportComment(id, commentText.trim());
      setComments((prev) => [...prev, newComment]);
      setCommentText("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible enviar el comentario.",
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const mapIncidentType = (incidentType: string) => {
    switch (incidentType.toLowerCase()) {
      case "deslave":
        return "deslave";
      case "trafico":
        return "trafico";
      case "clima":
        return "clima";
      default:
        return "trafico";
    }
  };

  const resolveIncidentLabel = (type: "deslave" | "trafico" | "clima") => {
    switch (type) {
      case "deslave":
        return "Deslave";
      case "trafico":
        return "Tráfico";
      case "clima":
        return "Clima";
    }
  };

  const resolveIncidentColor = (type: "deslave" | "trafico" | "clima") => {
    switch (type) {
      case "deslave":
        return "bg-red-500";
      case "trafico":
        return "bg-amber-500";
      case "clima":
        return "bg-blue-500";
    }
  };

  const formatTimeAgo = (isoTime: string) => {
    const createdAt = new Date(isoTime);
    if (Number.isNaN(createdAt.getTime())) {
      return "Hace unos momentos";
    }

    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMinutes = Math.max(1, Math.round(diffMs / 60000));
    if (diffMinutes < 60) {
      return `Hace ${diffMinutes} min`;
    }

    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) {
      return `Hace ${diffHours} h`;
    }

    const diffDays = Math.round(diffHours / 24);
    return `Hace ${diffDays} dias`;
  };

  const formatDateTime = (isoTime: string) => {
    const createdAt = new Date(isoTime);
    if (Number.isNaN(createdAt.getTime())) {
      return "Fecha no disponible";
    }

    return createdAt.toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 px-6 text-slate-600">
        Cargando reporte...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <p className="text-slate-600 mb-4">
            {errorMessage ?? "No se encontro el reporte solicitado."}
          </p>
          <Button onClick={() => navigate("/")}>Volver</Button>
        </div>
      </div>
    );
  }

  const incidentType = mapIncidentType(report.incidentType);
  const incidentLabel = resolveIncidentLabel(incidentType);
  const reportTitle = `${incidentLabel} en ${report.location}`;
  const reportTime = formatTimeAgo(report.createdAt);
  const incidentIcon =
    incidentType === "deslave" ? (
      <AlertTriangle className="w-6 h-6 text-white" />
    ) : incidentType === "trafico" ? (
      <Car className="w-6 h-6 text-white" />
    ) : (
      <CloudRain className="w-6 h-6 text-white" />
    );

  return (
    <div className="h-full flex flex-col bg-slate-50 pb-4">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-5 border-b border-slate-100 mb-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-4 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>

        <div className="flex items-center gap-3">
          <div
            className={`${resolveIncidentColor(incidentType)} p-3 rounded-full`}
          >
            {incidentIcon}
          </div>
          <div className="flex-1">
            <h1 className="text-xl mb-1 text-slate-900">{reportTitle}</h1>
            <p className="text-sm text-slate-500">
              Reporte de {report.reporter.name}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Location & Time */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-100">
          <div className="flex items-start gap-3 mb-3">
            <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-500 mb-1">Ubicación</p>
              <p className="text-slate-900">{report.location}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-500 mb-1">Reportado</p>
              <p className="text-slate-900">{reportTime}</p>
              <p className="text-xs text-slate-400">
                {formatDateTime(report.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-100">
          <h3 className="text-slate-900 mb-2">Descripción</h3>
          <p className="text-slate-600">{report.description}</p>
        </div>

        {report.hasPhoto && report.photoUrl && (
          <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-100">
            <h3 className="text-slate-900 mb-3">Fotografía</h3>
            <img
              src={report.photoUrl}
              alt="Fotografía del incidente"
              className="w-full rounded-xl border border-slate-200"
            />
          </div>
        )}

        {/* Details */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-100">
          <h3 className="text-slate-900 mb-3">Detalles del Reporte</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Tipo de incidente</span>
              <span className="text-slate-900">{incidentLabel}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Vía bloqueada</span>
              <span className="text-slate-900">
                {report.roadBlocked ? "Si" : "No"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Autoridades presentes</span>
              <span className="text-slate-900">
                {report.authoritiesPresent ? "Si" : "No"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Situación de emergencia</span>
              <span className="text-slate-900">
                {report.emergencySituation ? "Si" : "No"}
              </span>
            </div>
            {report.latitude !== null && report.longitude !== null && (
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Coordenadas</span>
                <span className="text-slate-900 text-sm">
                  {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Voting Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-100">
          <h3 className="text-slate-900 mb-3">¿Esta información es precisa?</h3>
          <p className="text-sm text-slate-600 mb-4">
            Tu voto ayuda a validar la información para otros usuarios
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => handleVote("up")}
              variant={userVote === "up" ? "default" : "outline"}
              disabled={isReacting}
              className={`flex-1 ${
                userVote === "up"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <ThumbsUp className="w-5 h-5 mr-2" />
              Sí ({votes.up})
            </Button>
            <Button
              onClick={() => handleVote("down")}
              variant={userVote === "down" ? "default" : "outline"}
              disabled={isReacting}
              className={`flex-1 ${
                userVote === "down"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <ThumbsDown className="w-5 h-5 mr-2" />
              No ({votes.down})
            </Button>
          </div>
        </div>

        {/* Comments Preview */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-900">Comentarios</h3>
            <span className="text-sm text-slate-500">
              {comments.length} comentarios
            </span>
          </div>
          {errorMessage && (
            <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </div>
          )}
          <div className="space-y-3">
            {comments.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Aun no hay comentarios. Se el primero en aportar.
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-100"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
                    <span className="text-sm text-slate-900">
                      {comment.author.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{comment.message}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmitComment} className="mt-4 space-y-2">
            <Textarea
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Escribe un comentario..."
              className="min-h-24 bg-white border-slate-200 focus:border-blue-500"
              maxLength={600}
            />
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmittingComment || !commentText.trim()}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {isSubmittingComment ? "Enviando..." : "Agregar comentario"}
            </Button>
          </form>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartir
          </Button>
        </div>
      </div>
    </div>
  );
}
