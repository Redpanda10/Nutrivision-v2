import { Tabs } from "expo-router";

export default function TabsLayout(){
 return(
  <Tabs initialRouteName="dashboard" screenOptions={{ headerShown: false }}>
    <Tabs.Screen name="dashboard" options={{title:"Dashboard"}} />
    <Tabs.Screen name="scan" options={{title:"Scan"}} />
    <Tabs.Screen name="history" options={{title:"History"}} />
    <Tabs.Screen name="profile" options={{title:"Profile"}} />
  </Tabs>
 )
}