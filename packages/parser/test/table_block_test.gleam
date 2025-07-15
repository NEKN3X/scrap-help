import gleam/option.{Some}
import monadic_parser/parser.{parse}
import scrapbox/table_block.{TableBlock}

pub fn table_block_test() {
  let p = table_block.parser()
  assert parse(p, "table: title\n cell1-1\n cell2-1")
    == Some(#(TableBlock(0, "title", [["cell1-1"], ["cell2-1"]]), ""))
  assert parse(p, " table: title\n  cell1-1\tcell1-2\n   cell2-1\t  cell2-2")
    == Some(#(
      TableBlock(1, "title", [["cell1-1", "cell1-2"], [" cell2-1", "  cell2-2"]]),
      "",
    ))
  assert parse(p, " table: title\n  cell1-1\tcell1-2\ncell2-1\tcell2-2")
    == Some(#(
      TableBlock(1, "title", [["cell1-1", "cell1-2"]]),
      "cell2-1\tcell2-2",
    ))
}
