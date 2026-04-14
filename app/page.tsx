"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
export default function Home() {
  const [fecha, setFecha] = useState("");
  const [servicio, setServicio] = useState("");
  const [monto, setMonto] = useState("");
  const [estado, setEstado] = useState("");
  const [gastos, setGastos] = useState<any[]>([]);
  const serviciosDisponibles = ["Luz", "Gas", "ABL", "Internet", "AYSA"];
  const [sesion, setSesion] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session);
    });
  }, []);

  useEffect(() => {
    if (sesion) {
      cargarGastos();
    }
  }, [sesion]);

  if (!sesion) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Button onClick={login}>
          Iniciar Sesión
        </Button>
      </main>
    );
  }

  const totalMes = gastos.reduce(
    (acc, gasto) => acc + Number(gasto.monto),
    0
  );

  const plataformas = [
    {
      nombre: "Edenor",
      url: "https://www.edenor.com/",
    },
    {
      nombre: "Metrogas",
      url: "https://www.metrogas.com.ar/",
    },
    {
      nombre: "Expensas",
      url: "https://www.tuadministrador.com/",
    },
  ];

  const linksServicios: Record<string, string> = {
    Luz: "https://www.edenor.com/",
    Gas: "https://www.metrogas.com.ar/",
    Expensas: "https://www.tuadministrador.com/",
  };

  const pagosPendientes = gastos.filter(
    (gasto) => gasto.estado.toLowerCase() === "pendiente"
  ).length;

  const serviciosActivos = new Set(
    gastos.map((gasto) => gasto.servicio)
  ).size;

  async function agregarGasto() {
    const { data, error } = await supabase
      .from("gastos")
      .insert([
        {
          fecha,
          servicio,
          monto: Number(monto),
          estado,
        },
      ]);

    if (error) {
      console.error(error);
      return;
    }

    await cargarGastos();

    setFecha("");
    setServicio("");
    setMonto("");
    setEstado("");
  }

  async function eliminarGasto(id: number) {
    const { error } = await supabase
      .from("gastos")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    await cargarGastos();
  }

  async function cargarGastos() {
    const { data, error } = await supabase
      .from("gastos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setGastos(data);
  }

  async function login() {
    const email = prompt("Email");
    const password = prompt("Contraseña");

    if (!email || !password) return;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    location.reload();
  }

  async function logout() {
    await supabase.auth.signOut();
    location.reload();
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Control de Gastos del Departamento</h1>

        <Button variant="outline" onClick={logout}>
          Cerrar Sesión
        </Button>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-500">Total este mes</p>
              <h2 className="text-2xl font-bold">
                ${totalMes}
              </h2>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-500">Pagos pendientes</p>
              <h2 className="text-2xl font-bold">
                {pagosPendientes}
              </h2>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-500">Servicios activos</p>
              <h2 className="text-2xl font-bold">
                {serviciosActivos}
              </h2>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">
              Cargar Nuevo Gasto
            </h2>

            <div className="grid md:grid-cols-4 gap-4">
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />

              <Select value={servicio} onValueChange={setServicio}>
                <SelectTrigger>
                  <SelectValue placeholder="Servicio" />
                </SelectTrigger>

                <SelectContent>
                  {serviciosDisponibles.map((serv) => (
                    <SelectItem key={serv} value={serv}>
                      {serv}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Monto"
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
              />

              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Pagado">Pagado</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={agregarGasto}>
              Agregar Gasto
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Gastos Cargados
            </h2>

            <div className="space-y-2">
              {gastos.map((gasto, index) => (
                <div
                  key={index}
                  className="p-3 bg-white rounded border flex justify-between items-center"
                >
                  <span>
                    {gasto.fecha} | {gasto.servicio} | $
                    {gasto.monto} | {gasto.estado}
                  </span>

                  <div className="flex gap-2">
                    {linksServicios[gasto.servicio] && (
                      <a
                        href={linksServicios[gasto.servicio]}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button size="sm">
                          Pagar
                        </Button>
                      </a>
                    )}

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => eliminarGasto(gasto.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Plataformas de Pago
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              {plataformas.map((plataforma, index) => (
                <a
                  key={index}
                  href={plataforma.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button className="w-full">
                    {plataforma.nombre}
                  </Button>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}