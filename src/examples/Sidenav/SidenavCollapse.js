import PropTypes from "prop-types";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useMaterialUIController } from "context";

function SidenavCollapse({ icon, name, caption, active, endAdornment }) {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  return (
    <ListItem component="li" sx={{ width: "100%", py: 0.25 }}>
      <MDBox
        sx={(theme) => ({
          width: "100%",
          display: "flex",
          alignItems: "center",
          borderRadius: 1.5,
          px: 1.25,
          py: 1,
          transition: "background .15s ease, color .15s ease, box-shadow .15s ease",
          bgcolor: active ? theme.palette.warning.main : "transparent",
          color: active ? "#fff" : theme.palette.text.primary,
          boxShadow: active ? "0 4px 10px rgba(255,165,0,0.35)" : "none",
          "&:hover": active ? { bgcolor: theme.palette.warning.dark } : { bgcolor: theme.palette.action.hover },
        })}
      >
        <ListItemIcon
          sx={(theme) => ({
            minWidth: 40,
            mr: 0.5,
            color: active ? "#fff" : theme.palette.text.secondary,
            "& .MuiSvgIcon-root, & .material-icons": { fontSize: 20 },
          })}
        >
          {typeof icon === "string" ? <Icon>{icon}</Icon> : icon}
        </ListItemIcon>

        {!miniSidenav && (
          <MDBox flexGrow={1} overflow="hidden">
            <MDTypography
              variant="button"
              fontWeight={active ? "bold" : "medium"}
              sx={{
                lineHeight: 1.1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: "inherit",
              }}
            >
              {name}
            </MDTypography>
            {caption && (
              <MDTypography
                variant="caption"
                sx={(theme) => ({
                  display: "block",
                  mt: 0.25,
                  color: active ? "rgba(255,255,255,0.85)" : theme.palette.text.secondary,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                })}
              >
                {caption}
              </MDTypography>
            )}
          </MDBox>
        )}

        {!miniSidenav && endAdornment}
      </MDBox>
    </ListItem>
  );
}

SidenavCollapse.defaultProps = { active: false, caption: "", endAdornment: null };
SidenavCollapse.propTypes = {
  icon: PropTypes.node.isRequired,
  name: PropTypes.string.isRequired,
  caption: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  active: PropTypes.bool,
  endAdornment: PropTypes.node,
};

export default SidenavCollapse;
