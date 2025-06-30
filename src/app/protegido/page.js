"use client";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/NavBar";
import ModalAgregar from "../../components/Modal/ModalAdd";
import ModalBackup from "../../components/Modal/ModalBackup";
import NotificationModal from "../../components/Modal/ModalNotificacion";

import {
  FaToilet,
  FaWarehouse,
  FaBuilding,
  FaUtensils,
  FaUsers,
  FaShieldAlt,
} from "react-icons/fa";
import { ImOffice } from "react-icons/im";
import { PiShippingContainerFill } from "react-icons/pi";
import { toast } from "react-toastify";

async function notifyUser(title, body) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  try {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(title, {
      body,
      icon: "/arricam.png",
    });
  } catch (err) {
    console.error("Error al mostrar la notificación:", err);
  }
}

export default function Home() {
  const [items, setItems] = useState({
    baños: [],
    BOD40: [],
    BOD20: [],
    oficinas: [],
    oficinasconbaño: [],
    comedores: [],
    camarines: [],
    guardias: [],
    reef: [],
  });
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const [isAgregarOpen, setIsAgregarOpen] = useState(false);
  const handleCloseAgregar = () => setIsAgregarOpen(false);
  const [currentDate, setCurrentDate] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [previousSummary, setPreviousSummary] = useState(null);
  const [mostrarBackup, setMostrarBackup] = useState(false);
  const [previousMonthSummary, setPreviousMonthSummary] = useState(null);

  const subscribeToPush = async () => {
    if (!("serviceWorker" in navigator))
      return alert("Service Workers no soportados");
    if (!("PushManager" in window)) return alert("PushManager no soportado");

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return alert("Debes permitir las notificaciones");
    }

    const registration = await navigator.serviceWorker.ready;
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!vapidKey) {
      console.error("Falta la clave pública VAPID en el cliente.");
      return;
    }

    const convertedVapidKey = urlBase64ToUint8Array(vapidKey);

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });

    const response = await fetch("/api/save-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subscription }),
    });

    const body = await response.json(); // ✅
    console.log("Respuesta del servidor:", body);

    console.log("Suscripción a Push creada:", subscription);
    setIsSubscribed(true);
    toast.success("¡Notificaciones activadas!");
  };

  function getLastDayOfPreviousMonth() {
    const date = new Date();
    date.setDate(0); // Día 0 del mes actual es el último del mes anterior
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`; // formato YYYY-MM-DD
  }

  // Convierte clave base64 a Uint8Array (necesario para push)
  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  }

  useEffect(() => {
    fetchItems();

    // Establecer la fecha actual
    const today = new Date();
    const formattedDate = today.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setCurrentDate(formattedDate);
  }, []);

  useEffect(() => {
    // Registrar el Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Worker registrado", reg);
        })
        .catch((err) => {
          console.error("Error registrando Service Worker:", err);
        });
    }
  }, []);
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      console.log("[PWA] Evento beforeinstallprompt detectado");
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then(async (registration) => {
        const existingSubscription =
          await registration.pushManager.getSubscription();
        if (existingSubscription) {
          setIsSubscribed(true); // 👈 Usuario ya está suscrito
        }
      });
    }
  }, []);
  useEffect(() => {
    fetch("/api/get-latest-summary")
      .then((res) => res.json())
      .then((data) => {
        console.log("⏳ Fecha del penúltimo resumen:", data);
        if (data?.date) {
          fetch(`/api/get-summary?date=${data.date}`)
            .then((res) => res.json())
            .then((summary) => {
              console.log("📊 Resumen cargado:", summary);
              setPreviousSummary(summary);
            });
        }
      })
      .catch((err) => {
        console.error("🔥 Error al obtener resumen:", err);
      });
  }, []);
  useEffect(() => {
    const lastDay = getLastDayOfPreviousMonth();
    fetch(`/api/get-summary?date=${lastDay}`)
      .then((res) => {
        if (!res.ok) {
          console.warn(`No se encontró resumen para ${lastDay}`);
          return null;
        }
        return res.json();
      })
      .then((summary) => {
        if (summary) {
          setPreviousMonthSummary(summary);
        }
      })
      .catch((err) => {
        console.error("Error al obtener resumen del mes anterior:", err);
      });
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/getItems");
      const data = await response.json();

      if (!Array.isArray(data)) {
        console.error("La respuesta no es una lista de ítems:", data);
        return;
      }

      const groupedItems = data.reduce((acc, item) => {
        if (!acc[item.tipo]) acc[item.tipo] = [];
        acc[item.tipo].push(item);
        return acc;
      }, {});

      setItems({
        baños: groupedItems.baño || [],
        BOD20: groupedItems.BOD20 || [],
        BOD40: groupedItems.BOD40 || [],
        oficinas: groupedItems.oficina || [],
        oficinasconbaño: groupedItems["oficina con baño"] || [],
        comedores: groupedItems.comedor || [],
        camarines: groupedItems.camarin || [],
        guardias: groupedItems.guardia || [],
        reef: groupedItems.reef || [],
      });
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStateCounts = (items, state) => {
    return items
      .filter((item) => item.estado === state)
      .reduce((sum, item) => sum + (item.cantidad || 0), 0);
  };

  const renderBlock = (type, items, Icon) => {
    const availableCount = calculateStateCounts(items, "disponible");
    const maintenanceCount = calculateStateCounts(items, "mantencion");
    const occupiedCount = calculateStateCounts(items, "arriendo");

    let formattedPreviousDate = "";
    if (previousSummary?.date) {
      const [year, month, day] = previousSummary.date.split("-");
      const fixedDate = new Date(year, month - 1, day);
      formattedPreviousDate = fixedDate.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    return (
      <div key={type} className="">
        <div className="bg-white rounded-xl shadow-md p-3">
          <div className="grid grid-cols-5 gap-1 sm:gap-2">
            <div className="flex items-center justify-center mb-2 flex-col sm:flex-row">
              <Icon className="h-8 w-8 text-gray-700 mb-1 sm:mb-0 sm:mr-1" />
              <h3 className="text-sm sm:text-lg font-bold text-gray-800 sm:ml-2">
                {type}
              </h3>
            </div>
            {/* Números destacados */}
            <div className="flex items-center justify-center bg-green-100 rounded-lg p-1 shadow text-green-600 font-extrabold text-3xl sm:text-4xl text-center border-2 border-green-600">
              {availableCount}
            </div>
            <div className="flex items-center justify-center bg-yellow-100 rounded-lg p-1 shadow text-yellow-500 font-extrabold text-3xl sm:text-4xl text-center border-2 border-yellow-500">
              {maintenanceCount}
            </div>
            <div className="flex items-center justify-center bg-red-100 rounded-lg p-1 shadow text-red-500 font-extrabold text-3xl sm:text-4xl text-center border-2 border-red-500">
              {occupiedCount}
            </div>
            <div className="flex items-center justify-center bg-blue-100 rounded-lg p-1 shadow text-blue-500 font-extrabold text-3xl sm:text-4xl text-center border-2 border-blue-500">
              {availableCount + maintenanceCount + occupiedCount}
            </div>
          </div>
        </div>
      </div>
    );
  };
  const calculateGlobalCount = (estado) =>
    Object.values(items).reduce(
      (total, group) =>
        total +
        group
          .filter((item) => item.estado === estado)
          .reduce((sum, i) => sum + (i.cantidad || 0), 0),
      0
    );
  const globalAvailable = calculateGlobalCount("disponible");
  const globalOccupied = calculateGlobalCount("arriendo");
  const globalMaintenance = calculateGlobalCount("mantencion");

  const globalStock = globalAvailable + globalOccupied + globalMaintenance;
  useEffect(() => {
    if (globalStock > 0) {
      const todayISO = new Date().toISOString().split("T")[0];

      fetch("/api/save-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: todayISO,
          globalAvailable,
          globalOccupied,
          globalMaintenance,
          globalStock,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Resumen global guardado:", data);
        })
        .catch((err) => console.error("Error al guardar resumen global:", err));
    }
  }, [globalAvailable, globalOccupied, globalMaintenance, globalStock]);

  useEffect(() => {
    fetch("/api/get-latest-summary")
      .then((res) => {
        if (!res.ok) {
          console.warn("No se pudo obtener la fecha más reciente con resumen");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.date) {
          fetch(`/api/get-summary?date=${data.date}`)
            .then((res) => {
              if (!res.ok) {
                console.warn(`Resumen no encontrado para ${data.date}`);
                return null;
              }
              return res.json();
            })
            .then((summary) => {
              if (summary) {
                setPreviousSummary(summary);
              }
            });
        }
      })
      .catch((err) => {
        console.error("Error al obtener el último resumen:", err);
      });
  }, []);
  let formattedPreviousDate = "";
  if (previousSummary?.date) {
    const [year, month, day] = previousSummary.date.split("-");
    const fixedDate = new Date(year, month - 1, day);
    formattedPreviousDate = fixedDate.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      {/* Spinner durante la carga */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <PiShippingContainerFill className="text-black text-4xl animate-spin" />
        </div>
      ) : (
        <>
          {showInstallPrompt && (
            <div className="fixed bottom-6 left-6 bg-white border border-gray-300 shadow-lg p-4 rounded-lg z-50">
              <p className="text-sm font-medium text-gray-800 mb-2">
                ¿Quieres agregar esta app a tu pantalla de inicio?
              </p>
              <button
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded border border-yellow-600"
                onClick={async () => {
                  if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    if (outcome === "accepted") {
                      console.log("Usuario aceptó instalar la app");
                    } else {
                      console.log("Usuario rechazó la instalación");
                    }
                    setDeferredPrompt(null);
                    setShowInstallPrompt(false);
                  }
                }}
              >
                Instalar App
              </button>
            </div>
          )}

          {!isSubscribed && (
            <button
              onClick={() => setShowNotificationModal(true)}
              className="fixed bottom-6 right-6 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-5 py-3 rounded-full shadow-lg border border-yellow-600 z-40 transition-all duration-300"
            >
              🔔 Activar notificaciones
            </button>
          )}

          {showNotificationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full text-center">
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  ¿Activar notificaciones?
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                  Recibe alertas cuando se agregue un nuevo ítem.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
                    onClick={() => setShowNotificationModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded border border-yellow-600"
                    onClick={async () => {
                      await subscribeToPush();
                      setShowNotificationModal(false);
                    }}
                  >
                    Activar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Contenido principal */}
          <Navbar
            onAddClick={() => setIsAgregarOpen(true)}
            onBackupClick={() => setMostrarBackup(true)}
          />

          <ModalBackup
            isOpen={mostrarBackup}
            onClose={() => setMostrarBackup(false)}
          />

          <ModalAgregar
            isOpen={isAgregarOpen}
            onClose={handleCloseAgregar}
            onSave={async (formData) => {
              // formData ya es un FormData válido
              try {
                const response = await fetch("/api/addItem", {
                  method: "POST",
                  body: formData, // ✅ Enviar directamente sin modificarlo
                });

                if (!response.ok) throw new Error("Failed to add item");
                await fetchItems(); // Refresca los ítems después de agregar
                handleCloseAgregar();
              } catch (error) {
                console.error(error);
              }
            }}
          />
          <div className="relative mb-9">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center text-black my-6">
              Stock de los container
            </h1>
            <div className="absolute top-0 right-0 text-gray-900 text-sm sm:text-base font-semibold mt-8 sm:mt-0 shadow-lg px-2 py-1 rounded-lg bg-yellow-200 border-2 border-yellow-400 ">
              {currentDate}
            </div>
          </div>
          {previousMonthSummary && (
            <div className="bg-white rounded-xl shadow-md p-4 transition-transform transform hover:scale-105 hover:shadow-lg flex flex-col items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Resumen Global Mes Anterior
              </h2>
              <div className="text-gray-600 text-sm font-medium mb-4">
                {new Date(previousMonthSummary.date).toLocaleDateString(
                  "es-ES",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full text-center">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-600">
                    Disponible para arriendo
                  </h3>
                  <div className="text-2xl font-extrabold text-green-600">
                    {previousMonthSummary.globalAvailable}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-600">
                    En Mantención
                  </h3>
                  <div className="text-2xl font-extrabold text-yellow-500">
                    {previousMonthSummary.globalMaintenance || 0}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-600">
                    Arriendado
                  </h3>
                  <div className="text-2xl font-extrabold text-red-500">
                    {previousMonthSummary.globalOccupied}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-600">
                    Stock Total
                  </h3>
                  <div className="text-2xl font-extrabold text-blue-500">
                    {previousMonthSummary.globalStock}
                  </div>
                </div>
              </div>
            </div>
          )}

          {previousSummary && (
            <div className="bg-white rounded-xl shadow-md p-4 transition-transform transform hover:scale-105 hover:shadow-lg flex flex-col items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Resumen Global del Día Anterior
              </h2>
              <div className="text-gray-600 text-sm font-medium mb-4">
                {formattedPreviousDate}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full text-center">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-600">
                    Disponible para arriendo
                  </h3>
                  <div className="text-2xl font-extrabold text-green-600">
                    {previousSummary.globalAvailable}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-600">
                    En Mantención
                  </h3>
                  <div className="text-2xl font-extrabold text-yellow-500">
                    {previousSummary.globalMaintenance || 0}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-600">
                    Arriendado
                  </h3>
                  <div className="text-2xl font-extrabold text-red-500">
                    {previousSummary.globalOccupied}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-600">
                    Stock Total
                  </h3>
                  <div className="text-2xl font-extrabold text-blue-500">
                    {previousSummary.globalStock}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resumen Global */}
          <div className="bg-white rounded-xl shadow-md p-4 transition-transform transform hover:scale-105 hover:shadow-lg flex flex-col items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Resumen Global
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full text-center">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-600">
                  Disponible para arriendo
                </h3>
                <div className="text-2xl font-extrabold text-green-600">
                  {globalAvailable}
                </div>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-600">
                  Mantención
                </h3>
                <div className="text-2xl font-extrabold text-yellow-500">
                  {globalMaintenance}
                </div>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-600">
                  Arriendado{" "}
                </h3>
                <div className="text-2xl font-extrabold text-red-500">
                  {globalOccupied}
                </div>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-600">
                  Stock Total
                </h3>
                <div className="text-2xl font-extrabold text-blue-500">
                  {globalStock}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center text-center">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                Items
              </h3>
              <h3 className="text-lg sm:text-xl font-bold text-green-600">
                Disponible para arriendo
              </h3>
              <h3 className="text-lg sm:text-xl font-bold text-yellow-500">
                En Mantención
              </h3>
              <h3 className="text-lg sm:text-xl font-bold text-red-500">
                Arrendados
              </h3>
              <h3 className="text-lg sm:text-xl font-bold text-blue-500">
                Stock Total
              </h3>
            </div>
          </div>

          <div className="grid grid-rows-8 gap-4">
            {renderBlock("Oficinas", items.oficinas, FaBuilding)}
            {renderBlock("Oficinas con baño", items.oficinasconbaño, ImOffice)}
            {renderBlock("Baños", items.baños, FaToilet)}
            {renderBlock("Comedores", items.comedores, FaUtensils)}
            {renderBlock("Camarines", items.camarines, FaUsers)}
            {renderBlock("Guardias", items.guardias, FaShieldAlt)}
            {renderBlock("BOD20", items.BOD20, FaWarehouse)}
            {renderBlock("BOD40", items.BOD40, FaWarehouse)}
            {renderBlock("Reef", items.reef, PiShippingContainerFill)}
          </div>
        </>
      )}
    </div>
  );
}
