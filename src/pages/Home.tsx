import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import {
  getCurrentWeatherByCoordinates,
  getNext24HoursWeatherByCoordinates,
  type CurrentWeather,
  type HourlyForecast,
} from "../services/weatherApi";
import { getReports, type Report } from "../services/reportApi";
import { getLocalNews, type LocalNewsItem } from "../services/localNewsApi";
import { getDeviceLocality } from "../services/locationApi";
import {
  Bell,
  X,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CloudRain,
  Car,
  CheckCircle2,
  TrendingUp,
  LoaderCircle,
  Newspaper,
  Filter,
  Radar,
  ChevronRight,
} from "lucide-react";

type EventType = "deslave" | "trafico" | "clima" | "noticia";
type EventSource = "verified" | "user" | "news";

interface Event {
  id: string;
  type: EventType;
  title: string;
  location: string;
  time: string;
  createdAt: string;
  source: EventSource;
  verified: boolean;
  votes: { up: number; down: number };
  description: string;
  url?: string;
}

export function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMountedRef = useRef(true);
  const [filter, setFilter] = useState<"all" | EventType>("all");
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(
    null,
  );
  const [deviceLocality, setDeviceLocality] = useState<string | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isForecastModalOpen, setIsForecastModalOpen] = useState(false);
  const [next24HoursLoading, setNext24HoursLoading] = useState(false);
  const [next24HoursError, setNext24HoursError] = useState<string | null>(null);
  const [next24Hours, setNext24Hours] = useState<HourlyForecast[]>([]);
  const [localNews, setLocalNews] = useState<LocalNewsItem[]>([]);
  const [localNewsLoading, setLocalNewsLoading] = useState(false);
  const [localNewsError, setLocalNewsError] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setWeatherLoading(false);
      setWeatherError("Tu dispositivo no soporta geolocalizacion.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setCoords({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });

        try {
          const [weather, locality] = await Promise.all([
            getCurrentWeatherByCoordinates(coords.latitude, coords.longitude),
            getDeviceLocality(coords.latitude, coords.longitude),
          ]);

          setCurrentWeather(weather);
          setDeviceLocality(locality);
          setWeatherError(null);
        } catch {
          try {
            const weather = await getCurrentWeatherByCoordinates(
              coords.latitude,
              coords.longitude,
            );

            setCurrentWeather(weather);
            setWeatherError(null);
          } catch {
            setWeatherError("No fue posible cargar el clima actual.");
          }
        } finally {
          setWeatherLoading(false);
        }
      },
      () => {
        setWeatherLoading(false);
        setWeatherError(
          "Permite la ubicacion para ver el clima actual de tu zona.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  }, []);

  const displayLocality = deviceLocality ?? currentWeather?.city;

  useEffect(() => {
    if (deviceLocality || !currentWeather) {
      return;
    }

    setDeviceLocality(currentWeather.city);
  }, [deviceLocality, currentWeather]);

  useEffect(() => {
    if (!currentWeather) {
      return;
    }

    if (weatherError) {
      setWeatherError(null);
    }
  }, [currentWeather, weatherError]);

  const weatherSubtitle =
    deviceLocality && currentWeather
      ? `${currentWeather.condition} - clima por coordenadas`
      : currentWeather?.condition;

  useEffect(() => {
    if (!displayLocality) {
      return;
    }

    let ignore = false;
    setLocalNewsLoading(true);
    setLocalNewsError(null);

    getLocalNews(displayLocality)
      .then((news) => {
        if (!ignore) {
          setLocalNews(news);
        }
      })
      .catch(() => {
        if (!ignore) {
          setLocalNewsError("No fue posible cargar noticias locales.");
        }
      })
      .finally(() => {
        if (!ignore) {
          setLocalNewsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [displayLocality]);

  const refreshReports = useCallback(
    async (silent = false) => {
      if (!silent) {
        setReportsLoading(true);
        setReportsError(null);
      }

      try {
        const data = await getReports(
          coords
            ? {
                limit: 50,
                latitude: coords.latitude,
                longitude: coords.longitude,
                radiusKm: 20,
              }
            : { limit: 50 },
        );
        if (!isMountedRef.current) return;
        setReports(data);
        setReportsError(null);
      } catch {
        if (!isMountedRef.current) return;
        if (!silent) {
          setReportsError("No fue posible cargar los reportes.");
        }
      } finally {
        if (!isMountedRef.current) return;
        if (!silent) {
          setReportsLoading(false);
        }
      }
    },
    [coords],
  );

  useEffect(() => {
    refreshReports(false);

    const intervalId = window.setInterval(() => {
      refreshReports(true);
    }, 10000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refreshReports]);

  useEffect(() => {
    const shouldRefresh = (
      location.state as { refreshReports?: boolean } | null
    )?.refreshReports;
    if (shouldRefresh) {
      refreshReports(true);
    }
  }, [location.state, refreshReports]);

  const mapIncidentType = (incidentType: string): EventType => {
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

  const resolveIncidentLabel = (type: EventType) => {
    switch (type) {
      case "deslave":
        return "Deslave";
      case "trafico":
        return "Tráfico";
      case "clima":
        return "Clima";
      case "noticia":
        return "Noticia";
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

  const newsEvents: Event[] = localNews.map((news) => ({
    id: news.id,
    type: news.category === "traffic" ? "trafico" : "noticia",
    title: news.title,
    location: news.location,
    time: news.timeAgo,
    createdAt: news.publishedAt,
    source: "news",
    verified: true,
    votes: { up: 0, down: 0 },
    description:
      news.summary ||
      (news.category === "traffic"
        ? "Noticia local con posible impacto vial."
        : "Noticia local de seguridad."),
    url: news.url,
  }));

  const reportEvents: Event[] = reports.map((report) => {
    const type = mapIncidentType(report.incidentType);
    const label = resolveIncidentLabel(type);

    return {
      id: report.id,
      type,
      title: `${label} en ${report.location}`,
      location: report.location,
      time: formatTimeAgo(report.createdAt),
      createdAt: report.createdAt,
      source: "user",
      verified: false,
      votes: report.reactions,
      description: report.description,
    };
  });

  const allEvents = [...newsEvents, ...reportEvents];
  const activeEventsCount = allEvents.length;
  const areaEventsCount = newsEvents.length + reportEvents.length;
  const verifiedEventsCount = allEvents.filter(
    (event) => event.verified,
  ).length;

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case "deslave":
        return <AlertTriangle className="w-5 h-5" />;
      case "trafico":
        return <Car className="w-5 h-5" />;
      case "clima":
        return <CloudRain className="w-5 h-5" />;
      case "noticia":
        return <Newspaper className="w-5 h-5" />;
    }
  };

  const getEventColor = (type: EventType) => {
    switch (type) {
      case "deslave":
        return "bg-red-500";
      case "trafico":
        return "bg-amber-500";
      case "clima":
        return "bg-blue-500";
      case "noticia":
        return "bg-violet-500";
    }
  };

  const filteredEvents =
    filter === "all"
      ? allEvents
      : allEvents.filter((event) => event.type === filter);

  const handleEventClick = (event: Event) => {
    if (event.url) {
      window.open(event.url, "_blank", "noopener,noreferrer");
      return;
    }

    navigate(`/event/${event.id}`);
  };

  const loadNext24HoursForecast = async () => {
    if (next24Hours.length > 0 || next24HoursLoading || !coords) return;

    setNext24HoursLoading(true);
    setNext24HoursError(null);

    try {
      const forecast = await getNext24HoursWeatherByCoordinates(
        coords.latitude,
        coords.longitude,
      );
      setNext24Hours(forecast.remainingHourlyForecast);
    } catch {
      setNext24HoursError(
        "No fue posible cargar el pronostico de las proximas 24 horas.",
      );
    } finally {
      setNext24HoursLoading(false);
    }
  };

  const handleWeatherCardClick = async () => {
    setIsForecastModalOpen(true);
    await loadNext24HoursForecast();
  };

  const filterOptions: { id: "all" | EventType; label: string }[] = [
    { id: "all", label: "Todas" },
    { id: "deslave", label: "Deslaves" },
    { id: "trafico", label: "Tráfico" },
    { id: "noticia", label: "Noticias" },
    { id: "clima", label: "Clima" },
  ];

  return (
    <div className="h-full overflow-y-auto bg-slate-50 pb-4">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 pt-6 pb-8 text-white">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h1 className="text-2xl mb-1">WayScout</h1>
            <p className="text-blue-100 text-sm">
              Alertas en tu ruta y noticias de tu zona.
            </p>
          </div>
          <button
            type="button"
            className="relative bg-white/15 backdrop-blur-sm rounded-2xl p-2.5 flex-shrink-0 hover:bg-white/25 transition-colors"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full ring-2 ring-blue-600" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white/12 backdrop-blur-sm rounded-xl p-3 border border-white/15">
            <p className="text-[11px] uppercase tracking-wide text-blue-100 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Activas
            </p>
            <p className="text-2xl mt-0.5">{activeEventsCount}</p>
          </div>
          <div className="bg-white/12 backdrop-blur-sm rounded-xl p-3 border border-white/15">
            <p className="text-[11px] uppercase tracking-wide text-blue-100 flex items-center gap-1">
              <Radar className="w-3 h-3" />
              En tu área
            </p>
            <p className="text-2xl mt-0.5">{areaEventsCount}</p>
          </div>
          <div className="bg-white/12 backdrop-blur-sm rounded-xl p-3 border border-white/15">
            <p className="text-[11px] uppercase tracking-wide text-blue-100 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Verificadas
            </p>
            <p className="text-2xl mt-0.5">{verifiedEventsCount}</p>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-5 space-y-4">
        <button
          type="button"
          onClick={handleWeatherCardClick}
          className="w-full text-left bg-white border border-slate-200 rounded-2xl p-4 shadow-md hover:shadow-lg hover:border-blue-200 transition-all"
        >
          {weatherLoading && (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <LoaderCircle className="w-4 h-4 animate-spin" />
              <span>Obteniendo clima de tu ubicación...</span>
            </div>
          )}

          {!weatherLoading && weatherError && (
            <div className="flex items-start gap-3">
              <div className="bg-amber-100 text-amber-600 rounded-xl p-2.5 flex-shrink-0">
                <CloudRain className="w-5 h-5" />
              </div>
              <p className="text-sm text-slate-600">{weatherError}</p>
            </div>
          )}

          {!weatherLoading && !weatherError && currentWeather && (
            <div className="flex items-start gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-2.5 flex-shrink-0 shadow-sm">
                <CloudRain className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">
                      Clima actual
                    </p>
                    <p className="text-base text-slate-900 truncate">
                      {displayLocality}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {weatherSubtitle}
                    </p>
                  </div>
                  <p className="text-3xl font-light text-slate-900 flex-shrink-0">
                    {Math.round(currentWeather.temperatureC)}°
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-4">
                  <span>Sens. {Math.round(currentWeather.feelsLikeC)}°</span>
                  <span>Humedad {currentWeather.humidity}%</span>
                  <span>Viento {Math.round(currentWeather.windKph)} km/h</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
            </div>
          )}
        </button>

        <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-slate-900">Filtrar alertas</h2>
              <p className="text-xs text-slate-500">Selecciona una categoría</p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {filterOptions.map((option) => {
              const isActive = filter === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFilter(option.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wide text-slate-500">
              Eventos recientes
            </h2>
            <span className="text-xs text-slate-500 bg-white border border-slate-200 rounded-full px-2.5 py-0.5">
              {filteredEvents.length}
            </span>
          </div>

          <div className="space-y-3">
            {localNewsLoading && (
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
                <LoaderCircle className="w-4 h-4 animate-spin" />
                <span>Analizando noticias locales...</span>
              </div>
            )}

            {!localNewsLoading && localNewsError && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm">
                {localNewsError}
              </div>
            )}

            {!localNewsLoading &&
              !localNewsError &&
              displayLocality &&
              localNews.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm">
                  <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                    <Newspaper className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-slate-700">
                    Sin noticias en tu localidad
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Te avisaremos cuando aparezca algo relevante.
                  </p>
                </div>
              )}

            {reportsLoading && (
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
                <LoaderCircle className="w-4 h-4 animate-spin" />
                <span>Cargando reportes recientes...</span>
              </div>
            )}

            {!reportsLoading && reportsError && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm">
                {reportsError}
              </div>
            )}

            {!reportsLoading && !reportsError && reportEvents.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <p className="text-sm text-slate-700">Sin reportes recientes</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Puedes crear un reporte desde el boton de reportes.
                </p>
              </div>
            )}

            {filteredEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => handleEventClick(event)}
                className="bg-white rounded-2xl shadow-sm p-4 border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`${getEventColor(
                      event.type,
                    )} p-3 rounded-xl text-white flex-shrink-0 shadow-sm`}
                  >
                    {getEventIcon(event.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-slate-900">{event.title}</h3>
                      {event.verified && (
                        <Badge className="bg-blue-50 text-blue-700 border border-blue-100 text-xs flex-shrink-0 hover:bg-blue-50">
                          ✓ Verificado
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{event.location}</span>
                    </div>

                    <p className="text-sm text-slate-600 mb-3">
                      {event.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-slate-400">
                          {event.time}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatDateTime(event.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-slate-500">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">{event.votes.up}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
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
        </section>
      </div>

      {isForecastModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-[1px] flex items-end sm:items-center sm:justify-center">
          <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
              <div>
                <p className="text-sm text-slate-500">Clima detallado</p>
                <h2 className="text-lg text-slate-900">Próximas 24 horas</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsForecastModalOpen(false)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                aria-label="Cerrar pronóstico"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto">
              {next24HoursLoading && (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                  <span>Cargando pronóstico...</span>
                </div>
              )}

              {!next24HoursLoading && next24HoursError && (
                <p className="text-sm text-red-600">{next24HoursError}</p>
              )}

              {!next24HoursLoading &&
                !next24HoursError &&
                next24Hours.length > 0 && (
                  <div className="space-y-2">
                    {next24Hours.map((hour) => (
                      <div
                        key={hour.time}
                        className="grid grid-cols-[56px_56px_1fr] items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                      >
                        <span className="text-sm text-slate-600">
                          {hour.time.slice(11, 16)}
                        </span>
                        <span className="text-base text-slate-900">
                          {Math.round(hour.temperatureC)}°
                        </span>
                        <div className="text-right">
                          <p className="text-sm text-slate-700 truncate">
                            {hour.condition}
                          </p>
                          <p className="text-xs text-slate-500">
                            {hour.chanceOfRain}% lluvia
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
