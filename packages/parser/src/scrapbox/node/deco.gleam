import monadic_parser/char.{type Char}

pub fn decoration_char(c: Char) {
  case c |> char.to_string {
    "*" -> True
    "!" -> True
    "\"" -> True
    "#" -> True
    "%" -> True
    "&" -> True
    "'" -> True
    "(" -> True
    ")" -> True
    "+" -> True
    "," -> True
    "-" -> True
    "." -> True
    "/" -> True
    "{" -> True
    "|" -> True
    "}" -> True
    "<" -> True
    ">" -> True
    "_" -> True
    "~" -> True
    _ -> False
  }
}
