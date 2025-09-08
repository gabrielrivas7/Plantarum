// src/app/dao/page.tsx
import Link from "next/link";

export default function DaoPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[75vh] px-6">
      <h2 className="text-2xl font-bold mb-4 text-center">🏛️ DAO – Gobernanza Forestal</h2>
      <p className="text-center max-w-2xl mb-12">
        Participa en la gobernanza forestal: crea propuestas, vota y consulta decisiones colectivas.
        También podrás crear comités especiales en el futuro 🌍.
      </p>

      <div className="flex flex-col items-center">

        {/* Primera fila */}
        <div className="card-row">
          <Link href="/dao/members" className="card">
            <div className="card-title">📋 Miembros</div>
            <p className="card-text">Consulta la lista de miembros activos de la DAO.</p>
          </Link>
          <Link href="/dao/propose" className="card">
            <div className="card-title">📝 Proponer</div>
            <p className="card-text">Crea nuevas propuestas para que sean votadas por la comunidad.</p>
          </Link>
        </div>

        {/* Segunda fila */}
        <div className="card-row">
          <Link href="/dao/vote" className="card">
            <div className="card-title">🗳️ Votar</div>
            <p className="card-text">Participa votando propuestas en curso.</p>
          </Link>
          <Link href="/dao/results" className="card">
            <div className="card-title">📊 Resultados</div>
            <p className="card-text">Consulta el estado y los resultados de las propuestas.</p>
          </Link>
        </div>

        {/* Tercera fila */}
        <div className="card-row">
          <Link href="/dao/committees" className="card">
            <div className="card-title">🏛️ Comités</div>
            <p className="card-text">
              Crea o consulta comités especiales de gobernanza. 
              (⚠️ Disponible para expansión futura).
            </p>
          </Link>
          <Link href="/dao/execute" className="card">
            <div className="card-title">⚡ Ejecutar</div>
            <p className="card-text">
              Crea o consulta comités especiales de gobernanza. 
              (⚠️ Disponible para expansión futura).
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
