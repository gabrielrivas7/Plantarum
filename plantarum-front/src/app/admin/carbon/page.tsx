//src/app/admin/carbon/page.tsx

"use client";

import { useForm } from "react-hook-form";
import { ethers } from "ethers";
import addresses from "@/utils/addresses_eth";
import Plantarum1155ABI from "@/abi/Plantarum1155.json";

export default function AdminCarbonPage() {
  const { register, handleSubmit, reset } = useForm();

  const onSubmitFee = async (data: any) => {
    try {
      if (!(window as any).ethereum) return;
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        addresses.Plantarum1155,
        Plantarum1155ABI,
        signer
      );

      const tx = await contract.setFeeVenta(Number(data.fee));
      await tx.wait();

      alert("✅ Fee de Carbon actualizado con éxito");
      reset();
    } catch (err) {
      console.error("❌ Error al actualizar fee:", err);
      alert("Error al actualizar fee");
    }
  };

  const onSubmitToken = async (data: any) => {
    try {
      if (!(window as any).ethereum) return;
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        addresses.Plantarum1155,
        Plantarum1155ABI,
        signer
      );

      const tx = await contract.setAllowedToken(data.token, true);
      await tx.wait();

      alert("✅ Token permitido agregado con éxito");
      reset();
    } catch (err) {
      console.error("❌ Error al agregar token:", err);
      alert("Error al agregar token");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-[75vh] px-6">
      <h2 className="text-2xl font-bold mb-6 text-center">🌍 Admin Créditos de Carbono</h2>

      {/* Formulario Fee */}
      <form
        onSubmit={handleSubmit(onSubmitFee)}
        className="bg-green-900 p-6 rounded-lg shadow-md w-full max-w-md mb-6"
      >
        <h3 className="text-lg font-semibold mb-4">Actualizar Fee de Venta</h3>
        <input
          {...register("fee", { required: true })}
          type="number"
          placeholder="Fee en basis points (ej: 200 = 2%)"
          className="input mb-4 w-full"
        />
        <button type="submit" className="btn w-full">
          Actualizar Fee
        </button>
      </form>

      {/* Formulario Token */}
      <form
        onSubmit={handleSubmit(onSubmitToken)}
        className="bg-green-900 p-6 rounded-lg shadow-md w-full max-w-md"
      >
        <h3 className="text-lg font-semibold mb-4">Agregar Token Permitido</h3>
        <input
          {...register("token", { required: true })}
          type="text"
          placeholder="Dirección ERC20"
          className="input mb-4 w-full"
        />
        <button type="submit" className="btn w-full">
          Agregar Token
        </button>
      </form>
    </main>
  );
}
