'use client';

import { TaxonomyInterface } from '@/lib/swipall/types/types';

interface FacetFiltersProps {
    taxonomies: TaxonomyInterface[];
    searchParams: Record<string, string | string[] | undefined>;
}

export function FacetFilters({ taxonomies, searchParams }: FacetFiltersProps) {

    const buildParams = (overrides: Record<string, string | null>) => {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(searchParams)) {
            if (key in overrides) continue;
            if (Array.isArray(value)) {
                value.forEach(v => params.append(key, v));
            } else if (value !== undefined) {
                params.set(key, value);
            }
        }
        for (const [key, value] of Object.entries(overrides)) {
            if (value !== null) params.set(key, value);
        }
        return params.toString();
    };

    const currentSelectedFilters = () => {
        const value = searchParams['taxonomy_value'];
        if (typeof value === 'string') return [value];
        if (Array.isArray(value)) return value;
        return [];
    };

    const navigateToFacet = (taxonomy: TaxonomyInterface) => {
        window.location.href = `?${buildParams({
            taxonomies__slug__and: taxonomy.slug,
            taxonomy_value: taxonomy.value ?? taxonomy.name,
        })}`;
    };

    const onClearFilters = () => {
        window.location.href = `?${buildParams({
            taxonomies__slug__and: null,
            taxonomy_value: null,
        })}`;
    };

    return (
        <div className="py-4 rounded-lg">
            {currentSelectedFilters().length > 0 && (
                <div className="mb-4 w-full border-b border-gray-300 pb-4 justify-between items-center">
                    <p className="text-sm font-semibold mb-2">Filtrando por:</p>
                    <ul className="space-y-3 text-sm text-white">
                        {currentSelectedFilters().map((filter) => (
                            <li key={filter} className="text-white">
                                <div className='flex flex-row justify-between items-center'>
                                    {filter}
                                    <button
                                        onClick={() => onClearFilters()}
                                        className="ml-2 text-red-500 hover:text-red-700 transition-colors p-2"
                                    >
                                        &times;
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {taxonomies.length > 0 && (
                <div>
                    <ul className="space-y-3 text-sm text-white">
                        {taxonomies.map((taxonomy) => (
                            <li key={taxonomy.id} className="text-white">
                                <a onClick={() => navigateToFacet(taxonomy)} className="cursor-pointer hover:text-primary transition-colors">
                                    {taxonomy.value ?? taxonomy.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
