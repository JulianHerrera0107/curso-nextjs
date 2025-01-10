import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data'; //Paso 3

//Paso 2: Leer el Id de la factura de la página de Invoices
export default async function Page(props: {params: Promise<{ id: string}> }) {
    const params = await props.params;

    //Paso 3: Extraer los datos de la factura en especifico
    const id = params.id; 
    const [invoice, customers] = await Promise.all([
        //Promise.all nos sirve para recibir tanto la factura como cliente
        //Recibimos una nueva Promise con los ID 
        fetchInvoiceById(id),
        fetchCustomers(),
    ]);

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form invoice={invoice} customers={customers} />
    </main>
  );
}