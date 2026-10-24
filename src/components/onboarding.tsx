import {View, Text, Image, Pressable, StyleSheet} from "react-native"
import {useState} from "react"
import React from "react";
import { radius } from "@/src/constants/radius";
import { spacing } from "@/src/constants/spacings";
import { fonts, fontSizes } from "@/src/constants/typography";
import useTheme from "@/src/hooks/useTheme";
type onboarding = {
    title: string; 
    description: string; 
    button: string; 
    mascot: React.ReactNode
}
export default function Onboarding() {
    const colors = useTheme()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [button, setButton] = useState("")
    const [mascot, setMascot] = useState(<img src = "./assets/images/empty"/>)
    function change_page(new_title:string,new_description:string,new_button:string,new_mascot:React.ReactNode){ 
        setTitle(new_title)
        setDescription(new_description)
        setButton(new_button)
        setMascot(new_mascot) 
    }
    return(
        <View style = {styles.scrollContent}>
            <Text style = {styles.title}> {title} </Text>
            <Text style = {styles.subtitle}> {title} </Text>
            {mascot}
            <Pressable style = {styles.button} onPress = {change_page}> next page </Pressable>
        </View>
    );
}
const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xxl,
        paddingBottom: spacing.xl,
        justifyContent: "center",
    },
    title: {
        fontSize: fontSizes.xl,
        fontFamily: fonts.heading,
        fontWeight: "700",
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: fontSizes.sm,
        fontFamily: fonts.body,
        lineHeight: 20,
    },
    button: {
        paddingVertical: spacing.xs,
    }
    });