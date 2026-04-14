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
  const serviciosDisponibles = [
    { nombre: "EDENOR", icono: "💡" },
    { nombre: "MetroGas", icono: "🔥" },
    { nombre: "ABL", icono: "🏠" },
    { nombre: "Internet", icono: "🌐" },
    { nombre: "AYSA", icono: "💧" },
  ];
  const [filtroMes, setFiltroMes] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sesion, setSesion] = useState<any>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");   

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
      <main className="min-h-screen flex items-center justify-center bg-slate-100">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 space-y-4">
            <form className="space-y-4" onSubmit={(e) => {e.preventDefault();login();}}>

              <h1 className="text-2xl font-bold text-center">Iniciar Sesión</h1>

              <Input type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}/>

              <Input type="password" placeholder="Contraseña" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}/>

              <Button type="submit" className="w-full">Ingresar</Button>

            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  const plataformas = [
    {
      nombre: "Edenor",
      url: "https://edenordigital.com/ingreso/bienvenida",
    },
    {
      nombre: "Metrogas",
      url: "https://registro.micuenta.metrogas.com.ar/",
    },
    {
      nombre: "AYSA",
      url: "https://oficinavirtual.web.aysa.com.ar/index.html",
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

  const gastosFiltrados = filtroMes
    ? gastos.filter((g) =>
        g.fecha?.startsWith(filtroMes)
      )
    : gastos;

    const gastosParaTotales = filtroMes ? gastosFiltrados : gastos;

    const totalMes = gastosParaTotales.reduce(
      (acc, gasto) => acc + Number(gasto.monto),
      0
    );

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

  async function toggleEstado(gasto: any) {
    const nuevoEstado =
      gasto.estado?.toLowerCase() === "pagado"
        ? "Pendiente"
        : "Pagado";

    const { error } = await supabase
      .from("gastos")
      .update({ estado: nuevoEstado })
      .eq("id", gasto.id);

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
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 p-6">

      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-xl px-3"
        >
          ☰
        </Button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-40">
          {/* fondo oscuro */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />

          {/* panel */}
          <div className="absolute top-0 right-0 h-full w-64 bg-white shadow-xl p-6 space-y-4">
              <Card>

                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">
                    Plataformas de Pago
                  </h2>

                  <div className="grid md:grid-rows gap-4">
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
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-white/70 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-14">
              <h1 className="text-4xl font-bold tracking-tight text-slate-800 font-mono">Control de Gastos</h1>
            </CardContent>

          </Card>

          <Card className="bg-white/70 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-6">
              <p className="text-xl text-slate-500 font-mono">Pagos pendientes</p>
              <h2 className="text-3xl font-bold text-amber-600">
                {pagosPendientes}
              </h2>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold">
              Cargar Nuevo Gasto
            </h2>

            <div className="grid md:grid-cols-4 gap-4">
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full"
              />

              <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                {serviciosDisponibles.map((serv) => (
                  <button
                    key={serv.nombre}
                    type="button"
                    onClick={() => setServicio(serv.nombre)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition ${
                      servicio === serv.nombre
                        ? "bg-slate-800 text-white border-slate-800"
                        : "bg-white hover:bg-slate-50 border-slate-200"
                    }`}
                  >
                    <span className="text-2xl">{serv.icono}</span>
                    <span className="text-sm mt-1">{serv.nombre}</span>
                  </button>
                ))}
              </div>

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

            <div>

              <h2 className="text-2xl font-semibold mb-4">Gastos</h2>

              <div className="flex items-center gap-2">
                
                <Input
                  type="month"
                  value={filtroMes}
                  onChange={(e) => setFiltroMes(e.target.value)}
                  className="w-48"
                />

                <Button variant="outline" onClick={() => setFiltroMes("")}>Limpiar</Button>

              </div>

            </div>
            

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500">Total este mes</p>
                <h2 className="text-3xl font-bold text-slate-800">
                  ${totalMes}
                </h2>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {gastosFiltrados.map((gasto, index) => (
                <div
                  key={index}
                  className="grid grid-cols-5 items-center p-4 bg-white/70 backdrop-blur border border-slate-100 rounded-xl shadow-sm"
                >
                  <span className="text-lg">
                    {gasto.servicio}
                  </span>

                  <div className="flex items-center gap-3">
                    <span className="text-base text-slate-500">
                      {gasto.fecha}
                    </span>
                  </div>

                  <span className="text-xl font-semibold text-slate-800">
                    ${gasto.monto}
                  </span>

                  <button
                    onClick={() => toggleEstado(gasto)}
                    className={`text-lg px-2 py-1 rounded-full w-fit transition ${
                      gasto.estado?.toLowerCase() === "pagado"
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                    }`}
                  >
                    {gasto.estado}
                  </button>

                  <div className="flex gap-2 justify-end">
                    {linksServicios[gasto.servicio] && (
                      <a
                        href={linksServicios[gasto.servicio]}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button size="lg">
                          Pagar
                        </Button>
                      </a>
                    )}

                    <Button
                      variant="destructive"
                      size="lg"
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

        <Button variant="outline" onClick={logout} className="bg-grey">
          Cerrar Sesión
        </Button>   

      </div>
    </main>
  );
}