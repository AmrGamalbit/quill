import {View, Text, Image, Pressable, StyleSheet} from "react-native"
import React, {useState} from "react";
import { radius } from "@/src/constants/radius";
import { spacing } from "@/src/constants/spacings";
import { fonts, fontSizes } from "@/src/constants/typography";
import useTheme from "@/src/hooks/useTheme";
export default function Onboarding() {
    const colors = useTheme()
    const [index, setIndex] = useState(0)
    const pages = [
        {
            title: "Start a new diary here",
            description: "inpsiring.",
            button: "Next →",
            image: require("./assets/images/icon.png")
        },
        {
            title: "Make your first entry!",
            description: "inpsiring.",
            button: "Next →",
            image: require("./assets/images/icon.png")
        },
        {
            title: "done!",
            description: "inpsiring.",
            button: "ok!",
            image: require("./assets/images/icon.png")
        },
    ]
    function change_page(){ 
        if(index < pages.length -1){
            setIndex(index+1);
        }else{
            //make invisible
        }
    }
    const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xxl,
        paddingBottom: spacing.xl,
        justifyContent: "center",
        backgroundColor: colors.colors.background, 
        alignItems: "center",
        marginVertical: spacing.xl,
    },
    title: {
        color: colors.colors.text,
        fontSize: fontSizes.xl,
        fontFamily: fonts.heading,
        fontWeight: "700",
        marginBottom: spacing.xs,
    },
    subtitle: {
        color: colors.colors.textMuted,
        fontSize: fontSizes.sm,
        fontFamily: fonts.body,
        lineHeight: 20,
    },
    button: {
        backgroundColor: colors.colors.accent,
        color: colors.colors.text,
        paddingVertical: spacing.xs,
        borderRadius: radius.sm
    }, 
    image:{
        width: 200, 
        height: 200, 
    }
    });
    return(
        <View style = {styles.scrollContent}>
            <Text style = {styles.title}> {pages[index].title} </Text>
            <Text style = {styles.subtitle}> {pages[index].description} </Text>
            <Image style = {styles.image} source = {pages[index].image}/>
            <Pressable 
                style = {({pressed})=> [
                    styles.button,
                    {backgroundColor: pressed? colors.colors.accent:colors.colors.accentPressed},
                    ]}
            onPress = {change_page}> 
                <Text style = {styles.button}>
                    {pages[index].button} 
                </Text>
            </Pressable>
        </View>
    );
}
