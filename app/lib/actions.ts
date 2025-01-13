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

//Conectar la Lógica de autenticación con el login
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

// ### ESQUEMA VALIDACION TIPO DE DATOS CON ZOD ### //

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        //Mensaje de bajo de la casilla para completar la casilla cliente
        invalid_type_error: 'Por favor selecciona un cliente.',
    }),
    amount: z.coerce
        .number()
        //Mensaje de bajo de la casilla para ingresar valores mayores a 0
        //Le decimos a Zod con la función .gt() una condición > 0
        .gt(0, { message: 'Por favor ingresa un valor mayor a $0.' }),
    status: z.enum(['pending', 'paid'], {
        //Mensaje de bajo de la casilla para seleccionar alguno de los estados
        invalid_type_error: 'Por favor selecciona un estado de la factura.',
    }),
    date: z.string(),
});

// ### PARAMETRO prevState ### //
//prevState contiene el estado pasado de useActionState hook. Es un prop requerido
export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};


// ############ FUNCIÓN CREAR FACTURA ############ //

//Omitimos la id y la fecha ya que no están presentes en el formulario
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(prevState: State, formData: FormData) {
    //Validar los campos del formulario usando Zod
    const validatedFields = CreateInvoice.safeParse({
        //Extraer los datos del formulario
        //const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    // Si el form de validación falla, retorna los errores temprano. De lo contrario, continua.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Campos faltantes. Imposible Crear la Factura.',
        };
    }
    console.log(validatedFields);

    // $$$$$ Preparar los datos para la inserción en la Base de datos $$$$$ ///
    const { customerId, amount, status } = validatedFields.data;
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
        // Si un error en la BD ocurre, retorna más de un error especifico.
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

export async function updateInvoice(
    id: string,
    prevState: State,
    formData: FormData,
) {
    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    // const { customerId, amount, status } = UpdateInvoice.parse({
    //     customerId: formData.get('customerId'),
    //     amount: formData.get('amount'),
    //     status: formData.get('status'),
    // });
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Datos Incorrectos. Fallo en la Actualización de la Factura.',
        };
    }

    const { customerId, amount, status } = validatedFields.data;
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

// ############ FUNCIÓN AUTENTICAR LOGIN ############ //

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}