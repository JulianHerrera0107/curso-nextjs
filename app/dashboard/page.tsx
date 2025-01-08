import { Card } from "../ui/dashboard/cards";
import RevenueChart from "../ui/dashboard/revenue-chart";
import LatestInvoices from "../ui/dashboard/latest-invoices";
import { lusitana } from "../ui/fonts";
import {
    fetchRevenue,
    fetchLatestInvoices,
    fetchCardData
} from "../lib/data";

export default async function Page() {
    //Obtiene la data de las ganancia mes a mes
    const revenue = await fetchRevenue();

    //Trae la data de las últimas 5 facturas, ordenando los datos
    const latestInvoices = await fetchLatestInvoices();

    const {
        //Suma total de las fácturas coleccionadas
        totalPaidInvoices,
        //Suma total de las fácturas pendientes
        totalPendingInvoices,
        //Número total de fácturas
        numberOfInvoices,
        //Número total de clientes
        numberOfCustomers,
    } = await fetchCardData();

    return (
        <main>
            <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
                Bienvenido al Dashboard
            </h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card title="Collected" value={totalPaidInvoices} type="collected" />
                <Card title="Pending" value={totalPendingInvoices} type="pending" />
                <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
                <Card title="Total Customers" value={numberOfCustomers} type="customers" />
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
                <RevenueChart revenue={revenue} />
                <LatestInvoices latestInvoices={latestInvoices} />
            </div>
        </main>
    );
}