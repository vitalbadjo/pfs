import { Box, Button, CircularProgress, SelectChangeEvent, TextField, Typography } from "@mui/material"
import { green } from "@mui/material/colors"
import { getDatabase } from "firebase/database"
import React, { ChangeEvent, PropsWithChildren, useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import { UserContext } from "../../providers/userContext"
import settingsService from "../../services/settings"
import { Project } from "../../models/projects-model"
import projectsService from "../../services/projects"


export const AddProject: React.FunctionComponent<PropsWithChildren> = () => {
  const navigate = useNavigate()
  const { user } = useContext(UserContext)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Omit<Project, "id" | "conditions">>({ displayName: "" })

  const onSave = async () => {
    if (user?.uid) {
      setLoading(true)
      await projectsService(getDatabase(), user?.uid)
        .create({
          displayName: form.displayName,

        })
      setLoading(false)
    }

  }

  const handleChange = (event: SelectChangeEvent | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, key: keyof typeof form) => {
    setForm(prevState => ({
      ...prevState,
      [key]: event.target.value
    }))
  };
  return <>
    <Box
      component="form"
      sx={{
        '& .MuiTextField-root': { m: 1, width: '25ch' },
      }}
      noValidate
      autoComplete="off"
    >
      <div>
        <TextField
          error={false}
          id="outlined-error"
          label="Project name"
          placeholder="Please enter project name"
          helperText=""
          value={form.displayName}
          onChange={e => handleChange(e, "displayName")}
          required
        />
      </div>
      <Box sx={{ m: 1, position: "relative", display: "inline-grid", gap: 1 }}>
        <Button
          disabled={loading}
          onClick={() => onSave()}
          variant="contained">Add currency</Button>
        {loading && (
          <CircularProgress
            size={24}
            sx={{
              color: green[500],
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-12px',
              marginLeft: '-12px',
            }}
          />
        )}
      </Box>

    </Box>
  </>
}