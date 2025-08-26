import linearGradient from "assets/theme/functions/linearGradient";
import colors from "assets/theme/base/colors";

const { gradients } = colors;

function backgroundImage() {
  if (!gradients || !gradients.info) {
    console.warn("Gradients.info no está definido, usando valores por defecto.");
    return linearGradient("#0288d1", "#01579b");
  }

  return linearGradient(gradients.info.main, gradients.info.state);
}

export default backgroundImage;
