import gleam/int
import gleam/list
import gleam/option.{Some}
import gleam/regexp
import monadic_parser/parser.{bind, pure}
import monadic_parser/regex
import scrapbox/node/node.{Icon}

pub fn parser(options: node.Options) {
  case options {
    node.Options(_, _, _, _) -> {
      let assert Ok(re) =
        regexp.from_string("\\[([^\\[\\]]+)\\.icon(?:\\*([1-9]\\d*))?\\]")
      use match <- bind(regex.rematch(re))
      case match {
        regexp.Match(raw, [Some(path)]) -> {
          pure([Icon(raw, path)])
        }
        regexp.Match(raw, [Some(path), Some(size)]) -> {
          let assert Ok(size) = int.parse(size)
          pure(Icon(raw, path) |> list.repeat(size))
        }
        _ -> parser.empty()
      }
    }
  }
}
