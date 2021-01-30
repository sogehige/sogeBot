export const mainLoaded = false;

export const isAvailableVariable = async function(variable: string) {
  return new Promise<void>((resolve, reject) => {
    const check = async (retry = 0) => {
      if (typeof (global as any)[variable] === 'undefined' || Object.keys((global as any)[variable]).length === 0) {
        if (retry > 500) {
          reject(variable + ' variable was not loaded');
        } else {
          setTimeout(() => {
            check(++retry);
          }, 10);
        }
      } else {
        resolve();
      }
    };
    check();
  });
};
