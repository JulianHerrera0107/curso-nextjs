//Marcando este archivo como un server actions nos habilita todas las funcionalidades
//Todas las funciones que se exportan en este archivo son de servidor y por lo tanto
//No se ejecutan ni se envían al cliente
'use server';

//Libreria de Typescript para validar el tipo de datos en la aplicación
import { z } from 'zod';

//Libreria de Vercel para realizar queries tipo SQL
import { sql } from '@vercel/postgres';

//Libreria para limpiar el cache y disparar una nueva solicitud en el servidor
import { revalidatePath } from 'next/cache';

//Libreria para rederigir de vuelta a la ruta Dashboard/invoices
import { redirect } from 'next/navigation';

// ### ESQUEMA VALIDACION TIPO DE DATOS CON ZOD ### //

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

// ############ FUNCIÓN CREAR FACTURA ############ //

//Omitimos la id y la fecha ya que no están presentes en el formulario
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
    //Extraer los datos del formulario
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    //Buena práctica transformar para evitar errores en el redondeo
    const amountInCents = amount * 100;
    //Crear el formarto "YYYY-MM-DD" para la creación de la factura en la BD
    //El split quita el Timestamp (Hora) utilizando Destructuring
    const date = new Date().toISOString().split('T')[0];

    //Realizando el Query a la BD.
    try {
        await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `; //Se transforma para evitar inyecciones de SQL
    } catch (error) {
        return {
            message: 'Error en la Base de datos: Fallo en la Creación de la Factura'
        };
    }
    //Limpiar el cache del cliente para poder hacer una nueva solicitud al servidor
    //Permitiendo traer los datos de forma actualizada
    revalidatePath('/dashboard/invoices');
    //Redireccionar a la página de Invoices
    redirect('/dashboard/invoices')

}

// ############ FUNCIÓN ACTUALIZAR FACTURA ############ //
// Paso 4. Pasando el ID a un Server Action

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;

    try {
        await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
    } catch (error) {
        return { message: 'Error en la Base de datos: Fallo en la Actualización de la Factura.' };
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

// ############ FUNCIÓN ELIMINAR FACTURA ############ //
export async function deleteInvoice(id: string) {
    //throw new Error('💀 Fallo mortal  al eliminar la factura 💀');
    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
        return { message: 'Factura Eliminada.' };
        // console.log('Factura Eliminada.');
    } catch (error) {
        return { message: 'Error en la Base de datos: Fallo en Eliminar la factura.' };
        // console.error('Error en la Base de Datos: Fallo en Eliminar la Factura.', error);
        // throw new Error('Error en la Base de Datos: Fallo en Eliminar la Factura.');
    }
}