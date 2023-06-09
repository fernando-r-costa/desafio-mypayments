import { faker } from '@faker-js/faker'


export type Person = {
  usuario: string
  titulo: 'Professor' | 'Orientador' | 'Instrutor'
  data: any
  valor: any
  pago: boolean
}

const range = (len: number) => {
  const arr = []
  for (let i = 0; i < len; i++) {
    arr.push(i)
  }
  return arr
}

const newPerson = (): Person => {
  return {
    usuario: faker.name.fullName(),
    titulo: faker.helpers.shuffle<Person['titulo']>([
      'Professor',
      'Orientador',
      'Instrutor',
    ])[0]!,
    data: faker.date.recent(10).toLocaleString("pt-BR"),
    valor: faker.finance.amount(50, 150, 2, 'R$ '),
    pago: faker.datatype.boolean(),
  }
}

export function makeData(...lens: number[]) {
  const makeDataLevel = (depth = 0): Person[] => {
    const len = lens[depth]!
    return range(len).map((d): Person => {
      return {
        ...newPerson(),
      }
    })
  }

  return makeDataLevel()
}
