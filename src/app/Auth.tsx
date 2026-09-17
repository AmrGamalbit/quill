import { Session } from "@supabase/supabase-js";
import * as Linking from 'expo-linking';
import { useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View, useColorScheme } from "react-native";
import Editor from "./Editor";
import { supabase } from "./utils/supabase";

export default function Auth() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const redirectUrl = Linking.createURL('login-callback');

    const styles = getStyles(isDark);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        const handleUrl = (url: string) => {
            const parsed = Linking.parse(url)
            if (parsed.path === "login-callback") {
                const params = parsed.queryParams;

                if (params?.access_token && params?.refresh_token) {
                    supabase.auth.setSession({
                        access_token: String(params.access_token),
                        refresh_token: String(params.refresh_token)
                    });
                }
            }
        }
        Linking.getInitialURL().then((url) => {
            if (url) handleUrl(url);
        });
        const linkingSub = Linking.addEventListener('url', (event) => {
            handleUrl(event.url);
        });
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        })
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        })
        return () => {
         subscription.unsubscribe()
         linkingSub.remove();
        };
    }, []);
    async function signInWithEmail() {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) Alert.alert("Login error", error.message);
        } catch (err: any) {
            Alert.alert("Error", err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }
    async function signUpWithEmail() {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectUrl } });

            if (error) {
                Alert.alert("Sign up error", error.message);
            } else if (data.session) {
                // Email confirmation is OFF, so Supabase automatically logged you in!
                // No alert needed, onAuthStateChange will switch screens automatically.
            } else {
                // Email confirmation is still ON
                Alert.alert("Check your inbox", "Click the link we sent to finish signing up.");
            }
        } catch (err: any) {
            Alert.alert("Error", err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }
    if (session && session.user) {
        return (
            <Editor />
        );
    }
    return (
        <View style={styles.container}>

            <Text style={styles.header}> Get Started</Text>

            <TextInput
                style={styles.input}
                placeholder="johndoe@example.com"
                value={email}
                autoCapitalize="none"
                onChangeText={(text) => setEmail(text)}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                autoCapitalize="none"
                secureTextEntry
                onChangeText={(text) => setPassword(text)}
            />
            <Button title="Sign In" disabled={loading} onPress={signInWithEmail} />
            <View style={{ height: 10 }} />
            <Button title="Sign Up" disabled={loading} onPress={signUpWithEmail} />
        </View>
    )
}
const getStyles = (isDark: boolean) => StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    header: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: isDark ? '#fff' : '#000' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 20, borderRadius: 8, marginBottom: 20, color: isDark ? '#fff' : '#000' }
});
