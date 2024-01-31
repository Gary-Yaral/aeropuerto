export const REGEX_FORM ={
  isNumber: /^\d+$/,
  isValidYear: /^2\d{3}$/,
  isValidText: /^[a-zA-Z0-9áéíóúñÁÉÍÓÚ\,\_\-]+( [a-zA-Z0-9áéíóúñÁÉÍÓÚ\,\_\-]+)*$/,
  isValidDNI: /^\d{10}$/,
  isValidNUMERO: /^\d{5}$/,
  isValidNAME: /^[a-zA-ZáéíóúñÁÉÍÓÚ]+( [a-zA-ZáéíóúñÁÉÍÓÚ]+)*$/,
  isValidLASTNAME: /^[a-zA-ZáéíóúñÁÉÍÓÚ]+( [a-zA-ZáéíóúñÁÉÍÓÚ]+)*$/,
  isDecimal: /^(0|[1-9]\d*)(\.\d+)?$/,
  isPositiveInteger: /^[1-9]\d*$/
}
