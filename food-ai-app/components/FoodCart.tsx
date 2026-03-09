import { View,Text } from "react-native";

export default function FoodCard({name}:{name:string}){
 return(
  <View>
   <Text>{name}</Text>
  </View>
 )
}