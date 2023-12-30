const fs = require("node:fs/promises");
const path = require("node:path");
const glob = require("fast-glob");
const logSymbols = require("log-symbols");
const colors = require("picocolors");
const yargs = require("yargs");

const COMPONENT_LIST = {
  "Pagination.Item": "PaginationItem",
  "Portal.Inner": "PortalInner",
  "Select.Divider": "SelectDivider",
  "Select.Header": "SelectHeader",
  "Select.Item": "SelectItem",
  "Select.Menu": "SelectMenu",
  "Breadcrumb.Divider": "BreadcrumbDivider",
  "Breadcrumb.Section": "BreadcrumbSection",
  "Form.Field": "FormField",
  "Form.Button": "FormButton",
  "Form.Checkbox": "FormCheckbox",
  "Form.Dropdown": "FormDropdown",
  "Form.Group": "FormGroup",
  "Form.Input": "FormInput",
  "Form.Radio": "FormRadio",
  "Form.Select": "FormSelect",
  "Form.TextArea": "FormTextArea",
  "Grid.Column": "GridColumn",
  "Grid.Row": "GridRow",
  "Menu.Header": "MenuHeader",
  "Menu.Item": "MenuItem",
  "Menu.Menu": "MenuMenu",
  "Message.Content": "MessageContent",
  "Message.Header": "MessageHeader",
  "Message.List": "MessageList",
  "Message.Item": "MessageItem",
  "Table.Body": "TableBody",
  "Table.Cell": "TableCell",
  "Table.Footer": "TableFooter",
  "Table.Header": "TableHeader",
  "Table.HeaderCell": "TableHeaderCell",
  "Table.Row": "TableRow",
  "Button.Content": "ButtonContent",
  "Button.Group": "ButtonGroup",
  "Button.Or": "ButtonOr",
  "Header.Content": "HeaderContent",
  "Header.Subheader": "HeaderSubheader",
  "Icon.Group": "IconGroup",
  "Image.Group": "ImageGroup",
  "Label.Detail": "LabelDetail",
  "Label.Group": "LabelGroup",
  "List.Content": "ListContent",
  "List.Description": "ListDescription",
  "List.Header": "ListHeader",
  "List.Icon": "ListIcon",
  "List.Item": "ListItem",
  "List.List": "ListList",
  "Placeholder.Header": "PlaceholderHeader",
  "Placeholder.Image": "PlaceholderImage",
  "Placeholder.Line": "PlaceholderLine",
  "Placeholder.Paragraph": "PlaceholderParagraph",
  "Reveal.Content": "RevealContent",
  "Segment.Group": "SegmentGroup",
  "Segment.Inline": "SegmentInline",
  "Step.Content": "StepContent",
  "Step.Description": "StepDescription",
  "Step.Group": "StepGroup",
  "Step.Title": "StepTitle",
  "Accordion.Accordion": "AccordionAccordion",
  "Accordion.Content": "AccordionContent",
  "Accordion.Panel": "AccordionPanel",
  "Accordion.Title": "AccordionTitle",
  "Dimmer.Dimmable": "DimmerDimmable",
  "Dimmer.Inner": "DimmerInner",
  "Dropdown.Divider": "DropdownDivider",
  "Dropdown.Header": "DropdownHeader",
  "Dropdown.Item": "DropdownItem",
  "Dropdown.Menu": "DropdownMenu",
  "Dropdown.SearchInput": "DropdownSearchInput",
  "Dropdown.Text": "DropdownText",
  "Modal.Actions": "ModalActions",
  "Modal.Content": "ModalContent",
  "Modal.Description": "ModalDescription",
  "Modal.Dimmer": "ModalDimmer",
  "Modal.Header": "ModalHeader",
  "Popup.Content": "PopupContent",
  "Popup.Header": "PopupHeader",
  "Rating.Icon": "RatingIcon",
  "Search.Category": "SearchCategory",
  "Search.CategoryLayout": "SearchCategoryLayout",
  "Search.Result": "SearchResult",
  "Search.Results": "SearchResults",
  "Sidebar.Pushable": "SidebarPushable",
  "Sidebar.Pusher": "SidebarPusher",
  "Tab.Pane": "TabPane",
  "Transition.Group": "TransitionGroup",
  "Card.Content": "CardContent",
  "Card.Description": "CardDescription",
  "Card.Group": "CardGroup",
  "Card.Header": "CardHeader",
  "Card.Meta": "CardMeta",
  "Comment.Author": "CommentAuthor",
  "Comment.Action": "CommentAction",
  "Comment.Actions": "CommentActions",
  "Comment.Avatar": "CommentAvatar",
  "Comment.Content": "CommentContent",
  "Comment.Group": "CommentGroup",
  "Comment.Metadata": "CommentMetadata",
  "Comment.Text": "CommentText",
  "Feed.Content": "FeedContent",
  "Feed.Date": "FeedDate",
  "Feed.Event": "FeedEvent",
  "Feed.Extra": "FeedExtra",
  "Feed.Label": "FeedLabel",
  "Feed.Like": "FeedLike",
  "Feed.Meta": "FeedMeta",
  "Feed.Summary": "FeedSummary",
  "Feed.User": "FeedUser",
  "Item.Content": "ItemContent",
  "Item.Description": "ItemDescription",
  "Item.Extra": "ItemExtra",
  "Item.Group": "ItemGroup",
  "Item.Header": "ItemHeader",
  "Item.Image": "ItemImage",
  "Item.Meta": "ItemMeta",
  "Statistic.Group": "StatisticGroup",
  "Statistic.Label": "StatisticLabel",
  "Statistic.Value": "StatisticValue"
};

const run = async () => {
  const argv = yargs(process.argv.slice(2))
    .usage("Usage: $0 [options]")
    .scriptName("semantic-ui-codemod-dot-syntax")
    .option("files", {
      alias: "f",
      type: "string",
      description: "A glob for files to patch",
      demandOption: true
    }).argv;

  console.log(logSymbols.info, `Using glob "${argv.files}" to patch files...`);

  const filesToPatch = await glob(argv.files, {
    cwd: process.cwd(),
    ignore: ["**/node_modules/**"]
  });

  console.log(
    logSymbols.info,
    `Found ${filesToPatch.length} files to patch...`
  );

  for (const file of filesToPatch) {
    const filePath = path.resolve(process.cwd(), file);

    const fileContent = await fs.readFile(filePath, { encoding: "utf8" });
    const fileHasDotSyntax = Object.keys(COMPONENT_LIST).some(component =>
      fileContent.includes(component)
    );

    if (!fileHasDotSyntax) {
      continue;
    }

    let newFileContent = fileContent;
    const importList = {};

    Object.entries(COMPONENT_LIST).forEach(([origin, replacement]) => {
      if (newFileContent.includes(origin)) {
        importList[origin] = replacement;
      }

      newFileContent = newFileContent.replace(
        new RegExp(origin, "g"),
        replacement
      );
    });

    if (Object.keys(importList).length > 0) {
      newFileContent = newFileContent.replace(
        /import \{(.*)} from ('|")semantic-ui-react('|")/,
        `import { $1, ${Object.values(importList).join(
          ", "
        )} } from $2semantic-ui-react$3`
      );
    }

    fs.writeFile(filePath, newFileContent);

    console.log(
      "- ",
      logSymbols.success,
      `Updated "${filePath}" with the following components:`
    );
    Object.entries(importList).forEach(([origin, replacement]) => {
      console.log(
        " ".repeat(4),
        colors.bgWhite(origin),
        "=>",
        colors.bgWhite(replacement)
      );
    });
  }

  console.log(
    colors.bgGreen(logSymbols.success + ` Patch was successfully applied`)
  );
};

export { run };
