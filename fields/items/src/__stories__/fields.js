import { ComponentsCollection } from "@panneau/core";

import Text, { Editor } from "../../../text/src/index";
import Items from "../ItemsField";

const fieldsCollection = new ComponentsCollection({
    Text,
    Items,
    Editor,
});

export default fieldsCollection;
