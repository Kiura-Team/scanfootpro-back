//Chequea el body
const checkBody = (
  body: any,
  keysAvailables: Array<string>
): string | null | undefined => {
  let message: string | null = null;

  for (let item of Object.keys(body)) {
    if (keysAvailables.includes(item)) {
      if (!body[item]) {
        message = `El campo '${item}' es requerido`;
        break;
      }
    } else {
      message = `El campo '${item}' no es permitido`;
      break;
    }
  }

  return message;
};

const validRegexBody = (
  body: any,
  validRules: any
): string | null | undefined => {
  let message: string | null = null;

  for (let item of Object.keys(body)) {
    const regex = new RegExp(validRules[item]);
    if (validRules[item]) {
      if (!regex.test(body[item])) {
        console.log(regex);
        message = `'${item}' no valido`;
        break;
      }
    }
  }
  return message;
};

export default { checkBody, validRegexBody };
