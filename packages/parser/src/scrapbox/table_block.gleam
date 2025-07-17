import gleam/list
import gleam/string
import monadic_parser/char.{type Char}
import monadic_parser/parser.{bind, pure} as p
import scrapbox/helper

fn is_separator(c: Char) {
  char.is_tab(c) || char.is_newline(c)
}

fn cell() {
  use x <- bind(p.many(p.not(is_separator)))
  pure(x |> char.join)
}

fn row() {
  use first_cell <- bind(cell())
  use cells <- bind(
    p.many({
      use _ <- bind(p.sat(char.is_tab))
      use x <- bind(cell())
      pure(x)
    }),
  )
  pure([first_cell] |> list.append(cells))
}

fn content_line(base: Int) {
  use _ <- bind(helper.block_indent(base))
  use row <- bind(row())
  pure(row)
}

fn content(base: Int) {
  use first_line <- bind(content_line(base))
  use lines <- bind(
    p.many({
      use _ <- bind(helper.new_line())
      use line <- bind(content_line(base))
      use _ <- bind(helper.eol())
      pure(line)
    }),
  )
  pure([first_line] |> list.append(lines))
}

pub fn parser() {
  use indent <- bind(helper.many_indent())
  let indent_size = indent |> string.length
  use _ <- bind(p.symbol("table:"))
  use title <- bind(helper.line_text())
  use table <- bind(
    {
      use _ <- bind(helper.new_line())
      use content <- bind(content(indent_size))
      use _ <- bind(helper.eol())
      pure(content)
    }
    |> p.alt({
      use _ <- bind(helper.eol())
      pure([])
    }),
  )

  pure(TableBlock(indent_size, title, table))
}

type Cell =
  String

pub type TableBlock {
  TableBlock(indent: Int, title: String, table: List(List(Cell)))
}
