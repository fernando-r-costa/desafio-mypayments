import React from 'react'
import ReactDOM from 'react-dom/client'

import './index.css'

import {
  useReactTable,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  sortingFns,
  getSortedRowModel,
  FilterFn,
  SortingFn,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table'

import {
  RankingInfo,
  rankItem,
  compareItems,
} from '@tanstack/match-sorter-utils'

import { makeData, Person } from './makeData'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank,
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

function App() {

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [globalFilter, setGlobalFilter] = React.useState('')

  const columns = React.useMemo<ColumnDef<Person, any>[]>(
    () => [
      {
        accessorFn: row => row.usuario,
        id: 'usuario',
        header: 'Usuário',
      },
      {
        accessorKey: 'titulo',
        header: 'Título',
      },
      {
        accessorKey: 'data',
        header: 'Data',
      },
      {
        accessorKey: 'valor',
        header: 'Valor',
      },
      { 
        accessorFn: row => row.pago,  
        id: 'pago',
        header: 'Pago',
      }
    ],
    []
  )

  const [data, setData] = React.useState<Person[]>(() => makeData(50))

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  })

  React.useEffect(() => {
    if (table.getState().columnFilters[0]?.id === 'fullName') {
      if (table.getState().sorting[0]?.id !== 'fullName') {
        table.setSorting([{ id: 'fullName', desc: false }])
      }
    }
  }, [table.getState().columnFilters[0]?.id])

  return (
    <div className="p-2">
      <header className="header">
        <h1><strong>My</strong>Payments</h1>
      </header>
      <main>
        <h2>Meus pagamentos</h2>
        <div className="tabela">
          <div className="controles">
            <div className="busca">
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={value => setGlobalFilter(String(value))}
                className="campo-busca"
                placeholder="Pesquisar por usuário"
              />
              <img src="./Exclude.png" alt=""></img>
            </div>
            <div className="paginacao">
              <div className="bloco-select-paginacao">
                <p>Exibir</p>
                <select className="select-paginacao"
                  value={table.getState().pagination.pageSize}
                  onChange={e => {
                    table.setPageSize(Number(e.target.value))
                  }}
                >
                  {[5, 10, 20].map(pageSize => (
                    <option key={pageSize} value={pageSize}>{pageSize}
                    </option>
                  ))}
                </select>
              </div>
              <div className="bloco-controle-paginacao">
                <button
                  className="button-controle-paginacao"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  {'<'}
                </button>
                <span className="info-paginacao">
                  <div>Página&nbsp;</div>
                  <strong>
                    {table.getState().pagination.pageIndex + 1} de{' '}
                    {table.getPageCount()}
                  </strong>
                </span>
                <button
                  className="button-controle-paginacao"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  {'>'}
                </button>
              </div>
            </div>
          </div>
          <table>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    return (
                      <th key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder ? null : (
                          <>
                            <div
                              {...{
                                className: header.column.getCanSort()
                                  ? 'cabecalho'
                                  : '',
                                onClick: header.column.getToggleSortingHandler(),
                              }}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            <img src="./Increment.png" alt=""></img>
                            </div>
                          </>
                        )}
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => {
                return (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => {
                      return (
                        <td>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                            )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

// A debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = React.useState(initialValue)

  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return (
    <input {...props} value={value} onChange={e => setValue(e.target.value)} />
  )
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
