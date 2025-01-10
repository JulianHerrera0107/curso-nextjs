//Marcando este archivo como un server actions nos habilita todas las funcionalidades
'use server';

//Libreria de Typescript para validar el tipo de datos en la aplicación
import { z } from 'zod';

import { sql } from '@vercel/postgres';

//Libreria para limpiar el cache y disparar una nueva solicitud en el servidor
import { revalidatePath } from 'next/cache';

//Libreria para rederigir de vuelta a la ruta Dashboard/invoices
import { redirect } from 'next/navigation';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    //Buena práctica transformar el valor en centavos
    const amountInCents = amount * 100;
    //Crear el formarto "YYYY-MM-DD" para la creación de la factura en la BD
    const date = new Date().toISOString().split('T')[0];

    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices')
    //Probamos si funciona
}