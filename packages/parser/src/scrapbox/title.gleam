import gleam/list
import gleam/option.{None, Some}
import gleam/regexp
import gleam/string
import monadic_parser/char
import monadic_parser/parser.{bind, many_blank, pure}
import scrapbox/helper.{not_space}

pub fn parser() {
  use blank <- bind(many_blank())
  use x <- bind(not_space())
  use xs <- bind(helper.line_text())
  pure(blank <> x |> char.append(xs))
}

pub type Title {
  Title(String)
}

pub fn extract(xs: String) {
  let assert Ok(re) = regexp.from_string("^[　\\s\n\t]*(\\S*.*)$")
  let assert Ok(re2) = regexp.from_string("\\s*[\\[\\]]\\s*|\\s")
  case parser.parse(parser(), xs) {
    Some(#(title, _)) ->
      Title(
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
    None -> Title("Untitled")
  }
}
