import type { Result } from 'neverthrow'
import type { Parser } from 'ts-monadic-parser'
import { err, ok } from 'neverthrow'
import { bind, orElse, parse, pure, sat, some, symbol } from 'ts-monadic-parser'

const letter = sat(x => /[^()|]/.test(x))
const str: Parser<string[]> = bind(some(letter), s => pure([s.join('')]))

// factor = '('literal')' | str
const factor: Parser<string[]> = orElse(
  bind(symbol('('), () =>
    // eslint-disable-next-line ts/no-use-before-define
    bind(literal, lit => bind(symbol(')'), () => pure(lit)))),
  str,
)

// synonym = factor(+synonym | ε)
const synonym: Parser<string[]> = bind(
  orElse(
    factor,
    bind(symbol('|'), () => bind(synonym, syn => pure([''].concat(syn)))),
  ),
  f =>
    orElse(
      bind(symbol('|'), () => bind(synonym, syn => pure(f.concat(syn)))),
      pure(f),
    ),
)

// literal = synonym(*literal | ε)
const literal: Parser<string[]> = bind(synonym, (syn) => {
  return orElse(
    bind(literal, lit =>
      pure(syn.flatMap(x => lit.map(y => x.concat(y))))),
    pure(syn),
  )
})

export function expand(helpfeel: string): Result<string[], Error> {
  const result = parse(literal)(helpfeel)
  if (result.length === 0 || result[0] === undefined)
    return err(new Error(`Invalid input: ${helpfeel}`))
  if (result[0][1] !== '')
    return err(new Error(`Unused input: ${result[0][1]}`))
  return ok(result[0][0])
}
