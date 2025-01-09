import CardWrapper from "../../ui/dashboard/cards";
import RevenueChart from "../../ui/dashboard/revenue-chart";
import LatestInvoices from "../../ui/dashboard/latest-invoices";
import { lusitana } from "../../ui/fonts";
import { Suspense } from "react";
import {
    RevenueChartSkeleton,
    LatestInvoicesSkeleton,
    CardsSkeleton,
} from "@/app/ui/skeletons";

export default async function Page() {
    //Trae la data de las últimas 5 facturas, ordenando los datos
    //const latestInvoices = await fetchLatestInvoices(); //Para el streaming
    // const {
    //     //Suma total de las fácturas coleccionadas
    //     totalPaidInvoices,
    //     //Suma total de las fácturas pendientes
    //     totalPendingInvoices,
    //     //Número total de fácturas
    //     numberOfInvoices,
    //     //Número total de clientes
    //     numberOfCustomers,
    // } = await fetchCardData();

    return (
        <main>
            <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
                Bienvenido al Dashboard
            </h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Suspense fallback={<CardsSkeleton />}>
                    <CardWrapper />
                </Suspense>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
                <Suspense fallback={<RevenueChartSkeleton />}>
                    <RevenueChart />
                </Suspense>
                <Suspense fallback={<LatestInvoicesSkeleton />}>
                    <LatestInvoices />
                </Suspense>
                {/*<LatestInvoices latestInvoices={latestInvoices} />*/}
            </div>
        </main>
    );
}