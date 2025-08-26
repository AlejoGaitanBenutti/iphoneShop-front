const apiUrl = process.env.REACT_APP_BACKEND_URL + "/api/historial/listar.php";

export const getHistorial = async () => {
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      credentials: 'include', // Para enviar cookies JWT si es necesario
    });

    if (!response.ok) {
      throw new Error('Error al obtener el historial');
    }

    const data = await response.json();
     
    return data;
  } catch (error) {
    console.error('❌ Error en getHistorial:', error);
    return [];
  }
};
