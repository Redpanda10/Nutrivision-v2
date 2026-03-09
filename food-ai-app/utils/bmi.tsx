export function calculateBMI(weight:number, height:number){
  return weight / ((height/100) * (height/100));
}