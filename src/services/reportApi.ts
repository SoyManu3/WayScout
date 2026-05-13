import { auth } from "../lib/firebase";
import { buildApiUrl } from "./apiBase";

export type ReportReactionSummary = {
  up: number;
  down: number;
};

export type ReportReporter = {
  id: string;
  name: string;
};

export type Report = {
  id: string;
  incidentType: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  description: string;
  roadBlocked: boolean;
  authoritiesPresent: boolean;
  emergencySituation: boolean;
  createdAt: string;
  reporter: ReportReporter;
  reactions: ReportReactionSummary;
  commentsCount: number;
  hasPhoto: boolean;
  photoUrl: string | null;
};

export type ReportComment = {
  id: string;
  message: string;
  createdAt: string;
  author: ReportReporter;
};

export type ReportUserReaction = {
  type: "UP" | "DOWN" | null;
};

export type CreateReportPayload = {
  incidentType: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  description: string;
  photo?: File | null;
  roadBlocked?: boolean;
  authoritiesPresent?: boolean;
  emergencySituation?: boolean;
};

export async function createReport(
  payload: CreateReportPayload,
): Promise<Report> {
  const token = await getAuthToken();
  const formData = new FormData();

  formData.append("incidentType", payload.incidentType);
  formData.append("location", payload.location);
  if (payload.latitude !== undefined && payload.latitude !== null) {
    formData.append("latitude", String(payload.latitude));
  }
  if (payload.longitude !== undefined && payload.longitude !== null) {
    formData.append("longitude", String(payload.longitude));
  }
  formData.append("description", payload.description);
  formData.append("roadBlocked", String(Boolean(payload.roadBlocked)));
  formData.append(
    "authoritiesPresent",
    String(Boolean(payload.authoritiesPresent)),
  );
  formData.append(
    "emergencySituation",
    String(Boolean(payload.emergencySituation)),
  );

  if (payload.photo) {
    formData.append("photo", payload.photo);
  }

  const response = await fetch(buildApiUrl("/api/reports"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await resolveErrorMessage(response));
  }

  return (await response.json()) as Report;
}

export async function getReports(params?: {
  limit?: number;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}): Promise<Report[]> {
  const searchParams = new URLSearchParams();
  if (params?.limit) {
    searchParams.set("limit", String(params.limit));
  }
  if (params?.latitude !== undefined && params?.longitude !== undefined) {
    searchParams.set("latitude", String(params.latitude));
    searchParams.set("longitude", String(params.longitude));
  }
  if (params?.radiusKm !== undefined) {
    searchParams.set("radiusKm", String(params.radiusKm));
  }

  const query = searchParams.toString();
  const response = await fetch(
    buildApiUrl(`/api/reports${query ? `?${query}` : ""}`),
  );

  if (!response.ok) {
    throw new Error("No se pudieron obtener los reportes.");
  }

  return (await response.json()) as Report[];
}

export async function getReport(reportId: string): Promise<Report> {
  const response = await fetch(buildApiUrl(`/api/reports/${reportId}`));

  if (!response.ok) {
    throw new Error("No se pudo obtener el reporte.");
  }

  return (await response.json()) as Report;
}

export async function getReportComments(
  reportId: string,
): Promise<ReportComment[]> {
  const response = await fetch(
    buildApiUrl(`/api/reports/${reportId}/comments`),
  );

  if (!response.ok) {
    throw new Error("No se pudieron obtener los comentarios.");
  }

  return (await response.json()) as ReportComment[];
}

export async function addReportComment(
  reportId: string,
  message: string,
): Promise<ReportComment> {
  const token = await getAuthToken();
  const response = await fetch(
    buildApiUrl(`/api/reports/${reportId}/comments`),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    },
  );

  if (!response.ok) {
    throw new Error(await resolveErrorMessage(response));
  }

  return (await response.json()) as ReportComment;
}

export async function reactToReport(
  reportId: string,
  type: "UP" | "DOWN",
): Promise<ReportReactionSummary> {
  const token = await getAuthToken();
  const response = await fetch(
    buildApiUrl(`/api/reports/${reportId}/reactions`),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type }),
    },
  );

  if (!response.ok) {
    throw new Error(await resolveErrorMessage(response));
  }

  return (await response.json()) as ReportReactionSummary;
}

export async function getReportUserReaction(
  reportId: string,
): Promise<ReportUserReaction> {
  const token = await getOptionalAuthToken();
  if (!token) {
    return { type: null };
  }

  const response = await fetch(
    buildApiUrl(`/api/reports/${reportId}/reactions/me`),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("No se pudo obtener la reaccion del usuario.");
  }

  return (await response.json()) as ReportUserReaction;
}

async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Usuario no autenticado.");
  }
  return user.getIdToken();
}

async function getOptionalAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }
  return user.getIdToken();
}

async function resolveErrorMessage(response: Response): Promise<string> {
  let detail = "Ocurrio un error en la solicitud.";
  try {
    const payload = (await response.json()) as {
      detail?: string;
      message?: string;
    };
    detail = payload.detail ?? payload.message ?? detail;
  } catch {
    // ignore parsing errors
  }
  return detail;
}
