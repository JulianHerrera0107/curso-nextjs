'use client';
//Componente que nos permite utilizar event listeners and hooks
//Por ejemplo, registrar las acciones del usuario en el input
import { useDebouncedCallback } from 'use-debounce';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    console.log(`Buscando... ${term}`);
    //URLSearchParams es una Web API que nos otorga métodos para manipular URL query parameters
    //Sin necesidad de crear una lógica compleja para capturarlos
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    //Ponemos la página en 1 cuando el usuario obtiene un resultado especifico o corto
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
    //Resultado esperado: /dashboard/invoices?query=busqueda_usuario.
    //El resultado es una URL valida que se actualiza en los componentes del usuario.
    //Sin la necesidad de actualizar la página completa.
  }, 350);

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(event) => {
          handleSearch(event.target.value);
        }}
        defaultValue={searchParams.get('query')?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
