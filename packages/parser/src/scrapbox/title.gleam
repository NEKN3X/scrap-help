import gleam/list
import gleam/option.{None, Some}
import gleam/regexp
import gleam/string
import monadic_parser/char
import monadic_parser/parser.{bind, many, pure, sat}

pub fn blank() {
  use x <- bind(many(sat(char.is_blank)))
  pure(x |> char.join)
}

fn letter() {
  use x <- bind(sat(fn(x) { !char.is_space(x) }))
  pure(x)
}

pub fn parser() {
  use blank <- bind(blank())
  use x <- bind(letter())
  use xs <- bind(many(sat(fn(x) { !char.is_newline(x) })))
  pure(blank <> x |> char.append(xs |> char.join))
}

pub type Title {
  Title(raw: String, title: String)
}

pub fn extract(xs: String) {
  let assert Ok(re) = regexp.from_string("^[　\\s\n\t]*(\\S*.*)$")
  let assert Ok(re2) = regexp.from_string("\\s*[\\[\\]]\\s*|\\s")
  case parser.parse(parser(), xs) {
    Some(#(title, _)) ->
      Title(
        title,
        title
          |> string.trim
          |> regexp.scan(re, _)
          |> list.flat_map(fn(m) {
            m.submatches
            |> list.filter(option.is_some)
          })
          |> list.map(option.unwrap(_, ""))
          |> string.concat
          |> regexp.replace(re2, _, "_"),
      )
    None -> Title(xs, "Untitled")
  }
}
